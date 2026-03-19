package com.revhire.profile.service;

import com.revhire.profile.dto.ProfileDto;
import com.revhire.profile.entity.JobSeekerProfile;
import com.revhire.profile.entity.SavedJob;
import com.revhire.profile.exception.AppException;
import com.revhire.profile.feign.AuthServiceClient;
import com.revhire.profile.repository.ProfileRepository;
import com.revhire.profile.repository.SavedJobRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);

    @Autowired private ProfileRepository profileRepository;
    @Autowired private SavedJobRepository savedJobRepository;
    @Autowired private AuthServiceClient authServiceClient;

    @Value("${file.upload-dir}") private String uploadDir;

@Transactional
public void createProfile(Long userId) {
    if (profileRepository.findByUserId(userId).isPresent()) return;
    JobSeekerProfile p = new JobSeekerProfile();
    p.setUserId(userId);
    try {
        Map<String, Object> userData = authServiceClient.getUserById(userId);
        if (userData != null && !userData.isEmpty()) {
            p.setName((String) userData.get("name"));
            p.setEmail((String) userData.get("email"));
            p.setPhone((String) userData.get("phone"));
            p.setLocation((String) userData.get("location"));
        }
    } catch (Exception e) {
        logger.warn("Could not fetch user data during profile creation for userId={}: {}", userId, e.getMessage());
    }
    profileRepository.save(p);
    logger.info("Profile created for userId: {}", userId);
}

    @Transactional
    public ProfileDto.ProfileResponse getProfile(Long userId) {
        // Lazily create profile if it wasn't created during registration
        // (can happen if profile-service was unavailable at registration time)
        JobSeekerProfile p = profileRepository.findByUserId(userId).orElseGet(() -> {
            logger.info("Profile not found for userId={}, creating lazily", userId);
            JobSeekerProfile newProfile = new JobSeekerProfile();
            newProfile.setUserId(userId);
            return profileRepository.save(newProfile);
        });
        return mapToResponse(p);
    }

    @Transactional
    @CircuitBreaker(name = "authService", fallbackMethod = "updateProfileFallback")
    public ProfileDto.ProfileResponse updateProfile(Long userId, ProfileDto.UpdateProfileRequest req) {
        JobSeekerProfile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Profile not found", 404));

        if (req.getName() != null || req.getPhone() != null || req.getLocation() != null) {
            try {
                Map<String, String> body = new HashMap<>();
                if (req.getName()     != null) body.put("name",     req.getName());
                if (req.getPhone()    != null) body.put("phone",    req.getPhone());
                if (req.getLocation() != null) body.put("location", req.getLocation());
                authServiceClient.updateUserBasic(userId, body);
            } catch (Exception e) {
                logger.warn("Could not sync basic info to auth-service: {}", e.getMessage());
            }
        }

        if (req.getName()                != null) p.setName(req.getName());
        if (req.getPhone()               != null) p.setPhone(req.getPhone());
        if (req.getLocation()            != null) p.setLocation(req.getLocation());
        if (req.getObjective()           != null) p.setObjective(req.getObjective());
        if (req.getEducation()           != null) p.setEducation(req.getEducation());
        if (req.getExperience()          != null) p.setExperience(req.getExperience());
        if (req.getSkills()              != null) p.setSkills(req.getSkills());
        if (req.getProjects()            != null) p.setProjects(req.getProjects());
        if (req.getCertifications()      != null) p.setCertifications(req.getCertifications());
        if (req.getTotalExperienceYears()!= null) p.setTotalExperienceYears(req.getTotalExperienceYears());
        if (req.getCurrentJobTitle()     != null) p.setCurrentJobTitle(req.getCurrentJobTitle());
        if (req.getLinkedinUrl()         != null) p.setLinkedinUrl(req.getLinkedinUrl());
        if (req.getPortfolioUrl()        != null) p.setPortfolioUrl(req.getPortfolioUrl());

        profileRepository.save(p);
        logger.info("Profile updated for userId: {}", userId);
        return mapToResponse(p);
    }

    public ProfileDto.ProfileResponse updateProfileFallback(Long userId, ProfileDto.UpdateProfileRequest req, Exception ex) {
        logger.warn("updateProfile fallback (auth sync skipped) for userId={}: {}", userId, ex.getMessage());
        JobSeekerProfile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Profile not found", 404));
        if (req.getName()                != null) p.setName(req.getName());
        if (req.getPhone()               != null) p.setPhone(req.getPhone());
        if (req.getLocation()            != null) p.setLocation(req.getLocation());
        profileRepository.save(p);
        return mapToResponse(p);
    }

    @Transactional
    public String uploadResume(Long userId, MultipartFile file) throws IOException {
        if (file.getSize() > 2 * 1024 * 1024)
            throw new AppException("File size must not exceed 2MB");
        String ct = file.getContentType();
        if (ct == null || (!ct.contains("pdf") && !ct.contains("word") && !ct.contains("document")))
            throw new AppException("Only PDF and DOCX files are allowed");

        JobSeekerProfile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Profile not found", 404));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        if (p.getResumeFilePath() != null) {
            try { Files.deleteIfExists(Paths.get(p.getResumeFilePath())); }
            catch (Exception e) { logger.warn("Could not delete old resume: {}", e.getMessage()); }
        }
        p.setResumeFileName(file.getOriginalFilename());
        p.setResumeFilePath(filePath.toString());
        p.setResumeContentType(ct);
        profileRepository.save(p);
        logger.info("Resume uploaded for userId: {}", userId);
        return filename;
    }

    @Transactional
    public void saveJob(Long userId, Long jobId, String jobTitle, String companyName,
                        String jobLocation, String jobType) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId))
            throw new AppException("Job already saved");
        SavedJob sj = new SavedJob();
        sj.setUserId(userId); sj.setJobId(jobId); sj.setJobTitle(jobTitle);
        sj.setCompanyName(companyName); sj.setJobLocation(jobLocation); sj.setJobType(jobType);
        savedJobRepository.save(sj);
    }

    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    public List<Map<String, Object>> getSavedJobs(Long userId) {
        return savedJobRepository.findByUserId(userId).stream().map(sj -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", sj.getId()); m.put("jobId", sj.getJobId());
            m.put("jobTitle", sj.getJobTitle()); m.put("companyName", sj.getCompanyName());
            m.put("jobLocation", sj.getJobLocation()); m.put("jobType", sj.getJobType());
            m.put("savedAt", sj.getSavedAt());
            return m;
        }).collect(Collectors.toList());
    }

    public boolean checkSaved(Long userId, Long jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    public Map<String, Object> getProfileInternal(Long userId) {
        JobSeekerProfile p = profileRepository.findByUserId(userId).orElse(null);
        if (p == null) return new HashMap<>();
        Map<String, Object> m = new HashMap<>();
        m.put("userId",               p.getUserId());
        m.put("name",                 p.getName()        != null ? p.getName()        : "");
        m.put("email",                p.getEmail()       != null ? p.getEmail()       : "");
        m.put("phone",                p.getPhone()       != null ? p.getPhone()       : "");
        m.put("location",             p.getLocation()    != null ? p.getLocation()    : "");
        m.put("resumeFileName",       p.getResumeFileName());
        m.put("skills",               p.getSkills());
        m.put("objective",            p.getObjective());
        m.put("education",            p.getEducation());
        m.put("experience",           p.getExperience());
        m.put("certifications",       p.getCertifications());
        m.put("projects",             p.getProjects());
        m.put("currentJobTitle",      p.getCurrentJobTitle());
        m.put("totalExperienceYears", p.getTotalExperienceYears());
        return m;
    }

    private ProfileDto.ProfileResponse mapToResponse(JobSeekerProfile p) {
        ProfileDto.ProfileResponse r = new ProfileDto.ProfileResponse();
        r.setUserId(p.getUserId()); r.setName(p.getName()); r.setEmail(p.getEmail());
        r.setPhone(p.getPhone()); r.setLocation(p.getLocation()); r.setEmploymentStatus(p.getEmploymentStatus());
        r.setProfileId(p.getId()); r.setObjective(p.getObjective()); r.setEducation(p.getEducation());
        r.setExperience(p.getExperience()); r.setSkills(p.getSkills()); r.setProjects(p.getProjects());
        r.setCertifications(p.getCertifications()); r.setTotalExperienceYears(p.getTotalExperienceYears());
        r.setCurrentJobTitle(p.getCurrentJobTitle()); r.setLinkedinUrl(p.getLinkedinUrl());
        r.setPortfolioUrl(p.getPortfolioUrl()); r.setResumeFileName(p.getResumeFileName());
        return r;
    }
}
