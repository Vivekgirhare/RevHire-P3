package com.revhire.application.service;

import com.revhire.application.dto.ApplicationDto;
import com.revhire.application.entity.Application;
import com.revhire.application.exception.AppException;
import com.revhire.application.feign.JobServiceClient;
import com.revhire.application.feign.NotificationServiceClient;
import com.revhire.application.feign.ProfileServiceClient;
import com.revhire.application.repository.ApplicationRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationService.class);

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private JobServiceClient jobServiceClient;
    @Autowired private ProfileServiceClient profileServiceClient;
    @Autowired private NotificationServiceClient notificationServiceClient;

    @Transactional
    @CircuitBreaker(name = "jobService", fallbackMethod = "applyFallback")
    public ApplicationDto.ApplicationResponse apply(Long userId, ApplicationDto.ApplyRequest request) {
        Map<String, Object> jobData = jobServiceClient.getJobById(request.getJobId());
        if (jobData == null) throw new AppException("Job not found", 404);
        if (!"ACTIVE".equals(jobData.get("status")))
            throw new AppException("This job is no longer accepting applications");
        if (applicationRepository.existsByJobIdAndJobSeekerUserIdAndStatusNot(request.getJobId(), userId, Application.ApplicationStatus.WITHDRAWN))
        throw new AppException("Already applied to this job");

        Application app = new Application();
        app.setJobId(request.getJobId());
        app.setJobSeekerUserId(userId);
        app.setCoverLetter(request.getCoverLetter());
        app.setStatus(Application.ApplicationStatus.APPLIED);
        app.setJobTitle((String) jobData.get("title"));
        app.setCompanyName((String) jobData.get("companyName"));
        app.setCompanyLocation((String) jobData.get("companyLocation"));
        Object empId = jobData.get("employerUserId");
        if (empId != null) app.setEmployerUserId(Long.parseLong(empId.toString().split("\\.")[0]));

        app = applicationRepository.save(app);
        logger.info("User {} applied to job {}", userId, request.getJobId());

        sendNotification(app.getEmployerUserId(), "New Application Received",
                "A candidate applied for " + app.getJobTitle(), "APPLICATION_STATUS", app.getId());
        return mapToResponse(app);
    }

    public ApplicationDto.ApplicationResponse applyFallback(Long userId, ApplicationDto.ApplyRequest request, Exception ex) {
        logger.error("Apply fallback triggered for userId={}, jobId={}: {}", userId, request.getJobId(), ex.getMessage());
        throw new AppException("Job service is currently unavailable. Please try again later.", 503);
    }

    @Transactional
    public void withdraw(Long userId, Long applicationId, String reason) {
        Application app = getForSeeker(userId, applicationId);
        if (app.getStatus() == Application.ApplicationStatus.WITHDRAWN)
            throw new AppException("Application already withdrawn");
        app.setStatus(Application.ApplicationStatus.WITHDRAWN);
        app.setWithdrawalReason(reason);
        applicationRepository.save(app);
        logger.info("User {} withdrew application {}", userId, applicationId);
    }

    public List<ApplicationDto.ApplicationResponse> getSeekerApplications(Long userId) {
        return applicationRepository.findByJobSeekerUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @CircuitBreaker(name = "jobService", fallbackMethod = "getJobApplicationsFallback")
    public List<ApplicationDto.ApplicationResponse> getJobApplications(Long userId, Long jobId) {
        Map<String, Object> jobData = jobServiceClient.getJobById(jobId);
        if (jobData == null) throw new AppException("Job not found", 404);
        Object empId = jobData.get("employerUserId");
        if (empId == null || Long.parseLong(empId.toString().split("\\.")[0]) != userId)
            throw new AppException("Unauthorized", 403);
        return applicationRepository.findByJobId(jobId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ApplicationDto.ApplicationResponse> getJobApplicationsFallback(Long userId, Long jobId, Exception ex) {
        logger.error("getJobApplications fallback triggered: {}", ex.getMessage());
        throw new AppException("Job service is currently unavailable. Please try again later.", 503);
    }

    @Transactional
    public ApplicationDto.ApplicationResponse updateStatus(Long userId, Long appId,
                                                            ApplicationDto.StatusUpdateRequest request) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new AppException("Application not found", 404));
        if (!userId.equals(app.getEmployerUserId())) throw new AppException("Unauthorized", 403);
        app.setStatus(request.getStatus());
        if (request.getNote() != null) app.setEmployerNote(request.getNote());
        app = applicationRepository.save(app);
        String statusMsg = request.getStatus().name().replace("_", " ");
        sendNotification(app.getJobSeekerUserId(), "Application Status Updated",
                "Your application for " + app.getJobTitle() + " has been " + statusMsg,
                "APPLICATION_STATUS", app.getId());
        logger.info("Application {} status -> {}", appId, request.getStatus());
        return mapToResponse(app);
    }

    public boolean checkApplied(Long userId, Long jobId) {
        return applicationRepository.existsByJobIdAndJobSeekerUserId(jobId, userId);
    }

    public Map<String, Object> getStats(Long employerUserId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total",   applicationRepository.countByEmployerUserId(employerUserId));
        stats.put("pending", applicationRepository.countPendingByEmployerUserId(employerUserId));
        return stats;
    }

    private Application getForSeeker(Long userId, Long appId) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new AppException("Application not found", 404));
        if (!app.getJobSeekerUserId().equals(userId)) throw new AppException("Unauthorized", 403);
        return app;
    }

    private ApplicationDto.ApplicationResponse mapToResponse(Application app) {
        ApplicationDto.ApplicationResponse r = new ApplicationDto.ApplicationResponse();
        r.setId(app.getId()); r.setJobId(app.getJobId()); r.setJobTitle(app.getJobTitle());
        r.setCompanyName(app.getCompanyName()); r.setCompanyLocation(app.getCompanyLocation());
        r.setCoverLetter(app.getCoverLetter()); r.setStatus(app.getStatus());
        r.setEmployerNote(app.getEmployerNote()); r.setAppliedAt(app.getAppliedAt());
        r.setUpdatedAt(app.getUpdatedAt()); r.setApplicantId(app.getJobSeekerUserId());
        try {
            Map<String, Object> profileData = profileServiceClient.getProfileInternal(app.getJobSeekerUserId());
            if (profileData != null) {
                r.setApplicantName((String)   profileData.get("name"));
                r.setApplicantEmail((String)  profileData.get("email"));
                r.setApplicantPhone((String)  profileData.get("phone"));
                r.setApplicantLocation((String) profileData.get("location"));
                r.setResumeFileName((String)  profileData.get("resumeFileName"));
                r.setSkills((String)          profileData.get("skills"));
                r.setObjective((String)       profileData.get("objective"));
                r.setEducation((String)       profileData.get("education"));
                r.setExperience((String)      profileData.get("experience"));
                r.setCertifications((String)  profileData.get("certifications"));
                r.setProjects((String)        profileData.get("projects"));
                r.setCurrentJobTitle((String) profileData.get("currentJobTitle"));
                Object exp = profileData.get("totalExperienceYears");
                if (exp != null) r.setTotalExperienceYears(Integer.parseInt(exp.toString().split("\\.")[0]));
            }
        } catch (Exception e) { logger.warn("Could not fetch applicant profile: {}", e.getMessage()); }
        return r;
    }

    private void sendNotification(Long userId, String title, String msg, String type, Long refId) {
        try {
            ApplicationDto.CreateNotificationRequest n = new ApplicationDto.CreateNotificationRequest();
            n.setUserId(userId); n.setTitle(title); n.setMessage(msg); n.setType(type); n.setReferenceId(refId);
            notificationServiceClient.createNotification(n);
        } catch (Exception e) { logger.error("Failed to send notification: {}", e.getMessage()); }
    }
}
