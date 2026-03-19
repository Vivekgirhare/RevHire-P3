package com.revhire.job.service;

import com.revhire.job.dto.JobDto;
import com.revhire.job.entity.Job;
import com.revhire.job.exception.AppException;
import com.revhire.job.feign.ApplicationServiceClient;
import com.revhire.job.feign.CompanyServiceClient;
import com.revhire.job.feign.ProfileServiceClient;
import com.revhire.job.repository.JobRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {
    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    @Autowired private JobRepository jobRepository;
    @Autowired private ApplicationServiceClient applicationServiceClient;
    @Autowired private ProfileServiceClient profileServiceClient;
    @Autowired private CompanyServiceClient companyServiceClient;

    @Transactional
    @CircuitBreaker(name = "companyService", fallbackMethod = "createJobFallback")
    public JobDto.JobResponse createJob(Long userId, JobDto.CreateJobRequest request) {
        Map<String, Object> companyData = getCompanyDataForUser(userId);
        Long companyId  = Long.parseLong(companyData.get("id").toString().split("\\.")[0]);
        String companyName     = (String) companyData.getOrDefault("name",     "");
        String companyIndustry = (String) companyData.getOrDefault("industry", "");
        String companyLocation = (String) companyData.getOrDefault("location", "");

        Job job = new Job();
        mapRequestToJob(request, job);
        job.setEmployerUserId(userId);
        job.setCompanyId(companyId);
        job.setCompanyName(companyName);
        job.setCompanyIndustry(companyIndustry);
        job.setCompanyLocation(companyLocation);
        job.setStatus(Job.JobStatus.ACTIVE);
        job = jobRepository.save(job);
        logger.info("Job created: {} by company: {}", job.getTitle(), companyName);
        return mapJobToResponse(job, false, false);
    }

    public JobDto.JobResponse createJobFallback(Long userId, JobDto.CreateJobRequest request, Exception ex) {
        logger.error("createJob fallback for userId={}: {}", userId, ex.getMessage());
        throw new AppException("Company service is currently unavailable. Please try again later.", 503);
    }

    @CircuitBreaker(name = "companyService", fallbackMethod = "getEmployerJobsFallback")
    public List<JobDto.JobResponse> getEmployerJobs(Long userId) {
        Map<String, Object> companyData = getCompanyDataForUser(userId);
        Long companyId = Long.parseLong(companyData.get("id").toString().split("\\.")[0]);
        return jobRepository.findByCompanyId(companyId)
                .stream().map(j -> mapJobToResponse(j, false, false))
                .collect(Collectors.toList());
    }

    public List<JobDto.JobResponse> getEmployerJobsFallback(Long userId, Exception ex) {
        logger.error("getEmployerJobs fallback for userId={}: {}", userId, ex.getMessage());
        throw new AppException("Company service is currently unavailable. Please try again later.", 503);
    }

    public List<JobDto.JobResponse> searchJobs(JobDto.JobSearchRequest request, Long userId) {
        List<Job> jobs = jobRepository.searchJobs(
                request.getTitle(), request.getLocation(),
                request.getJobType(), request.getMaxExperience(), request.getCompanyName());
        return jobs.stream().map(j -> {
            boolean applied = false, saved = false;
            if (userId != null) {
                try { applied = Boolean.TRUE.equals(applicationServiceClient.checkApplied(userId, j.getId())); }
                catch (Exception e) { logger.warn("Could not check applied: {}", e.getMessage()); }
                try { saved = Boolean.TRUE.equals(profileServiceClient.checkSaved(userId, j.getId())); }
                catch (Exception e) { logger.warn("Could not check saved: {}", e.getMessage()); }
            }
            return mapJobToResponse(j, applied, saved);
        }).collect(Collectors.toList());
    }

    public JobDto.JobResponse getJobById(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", 404));
        boolean applied = false, saved = false;
        if (userId != null) {
            try { applied = Boolean.TRUE.equals(applicationServiceClient.checkApplied(userId, jobId)); }
            catch (Exception e) { logger.warn("Could not check applied: {}", e.getMessage()); }
            try { saved = Boolean.TRUE.equals(profileServiceClient.checkSaved(userId, jobId)); }
            catch (Exception e) { logger.warn("Could not check saved: {}", e.getMessage()); }
        }
        return mapJobToResponse(job, applied, saved);
    }

    @Transactional
    @CircuitBreaker(name = "companyService", fallbackMethod = "updateJobFallback")
    public JobDto.JobResponse updateJob(Long userId, Long jobId, JobDto.CreateJobRequest request) {
        Job job = getJobForEmployer(userId, jobId);
        mapRequestToJob(request, job);
        return mapJobToResponse(jobRepository.save(job), false, false);
    }

    public JobDto.JobResponse updateJobFallback(Long userId, Long jobId, JobDto.CreateJobRequest request, Exception ex) {
        logger.error("updateJob fallback: {}", ex.getMessage());
        throw new AppException("Company service is currently unavailable. Please try again later.", 503);
    }

    @Transactional
    @CircuitBreaker(name = "companyService")
    public void updateJobStatus(Long userId, Long jobId, Job.JobStatus status) {
        Job job = getJobForEmployer(userId, jobId);
        job.setStatus(status);
        jobRepository.save(job);
        logger.info("Job {} status updated to {}", jobId, status);
    }

    @Transactional
    @CircuitBreaker(name = "companyService")
    public void deleteJob(Long userId, Long jobId) {
        jobRepository.delete(getJobForEmployer(userId, jobId));
        logger.info("Job {} deleted", jobId);
    }

    public Job findJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", 404));
    }

    public Map<String, Object> getJobStats(Long companyId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs",  jobRepository.countByCompanyId(companyId));
        stats.put("activeJobs", jobRepository.countActiveByCompanyId(companyId));
        return stats;
    }

    private Job getJobForEmployer(Long userId, Long jobId) {
        Map<String, Object> companyData = getCompanyDataForUser(userId);
        Long companyId = Long.parseLong(companyData.get("id").toString().split("\\.")[0]);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", 404));
        if (!job.getCompanyId().equals(companyId))
            throw new AppException("Unauthorized access to this job", 403);
        return job;
    }

    private Map<String, Object> getCompanyDataForUser(Long userId) {
        try {
            Map<String, Object> data = companyServiceClient.getCompanyByUser(userId);
            if (data == null) throw new AppException("Company not found");
            return data;
        } catch (AppException e) { throw e; }
        catch (Exception e) { throw new AppException("Company not found for user"); }
    }

    private void mapRequestToJob(JobDto.CreateJobRequest r, Job job) {
        job.setTitle(r.getTitle()); job.setDescription(r.getDescription());
        job.setRequiredSkills(r.getRequiredSkills()); job.setRequiredEducation(r.getRequiredEducation());
        job.setMinExperienceYears(r.getMinExperienceYears()); job.setMaxExperienceYears(r.getMaxExperienceYears());
        job.setLocation(r.getLocation()); job.setIsRemote(r.getIsRemote());
        job.setMinSalary(r.getMinSalary()); job.setMaxSalary(r.getMaxSalary());
        job.setJobType(r.getJobType()); job.setApplicationDeadline(r.getApplicationDeadline());
        job.setNumberOfOpenings(r.getNumberOfOpenings());
    }

    public JobDto.JobResponse mapJobToResponse(Job job, boolean applied, boolean saved) {
        JobDto.JobResponse r = new JobDto.JobResponse();
        r.setId(job.getId()); r.setTitle(job.getTitle()); r.setDescription(job.getDescription());
        r.setRequiredSkills(job.getRequiredSkills()); r.setRequiredEducation(job.getRequiredEducation());
        r.setMinExperienceYears(job.getMinExperienceYears()); r.setMaxExperienceYears(job.getMaxExperienceYears());
        r.setLocation(job.getLocation()); r.setIsRemote(job.getIsRemote());
        r.setMinSalary(job.getMinSalary()); r.setMaxSalary(job.getMaxSalary());
        r.setJobType(job.getJobType()); r.setStatus(job.getStatus());
        r.setApplicationDeadline(job.getApplicationDeadline()); r.setNumberOfOpenings(job.getNumberOfOpenings());
        r.setPostedAt(job.getPostedAt()); r.setCompanyId(job.getCompanyId());
        r.setCompanyName(job.getCompanyName()); r.setCompanyIndustry(job.getCompanyIndustry());
        r.setCompanyLocation(job.getCompanyLocation());
        r.setAlreadyApplied(applied); r.setSaved(saved);
        return r;
    }
}
