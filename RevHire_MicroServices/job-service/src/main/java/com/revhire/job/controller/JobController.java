package com.revhire.job.controller;

import com.revhire.job.dto.JobDto;
import com.revhire.job.entity.Job;
import com.revhire.job.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired private JobService jobService;

    // ── PUBLIC ──────────────────────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<List<JobDto.JobResponse>> searchJobs(
            @ModelAttribute JobDto.JobSearchRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Long uid = parseUserId(userId);
        return ResponseEntity.ok(jobService.searchJobs(request, uid));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto.JobResponse> getJobById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Long uid = parseUserId(userId);
        return ResponseEntity.ok(jobService.getJobById(id, uid));
    }

    // ── EMPLOYER ─────────────────────────────────────────────────────────────
    @PostMapping("/employer/create")
    public ResponseEntity<JobDto.JobResponse> createJob(
            @RequestBody JobDto.CreateJobRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(jobService.createJob(Long.parseLong(userId), request));
    }

    @GetMapping("/employer/my-jobs")
    public ResponseEntity<List<JobDto.JobResponse>> getEmployerJobs(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(jobService.getEmployerJobs(Long.parseLong(userId)));
    }

    @PutMapping("/employer/{id}")
    public ResponseEntity<JobDto.JobResponse> updateJob(
            @PathVariable Long id, @RequestBody JobDto.CreateJobRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(jobService.updateJob(Long.parseLong(userId), id, request));
    }

    @PatchMapping("/employer/{id}/status")
    public ResponseEntity<Map<String, String>> updateJobStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {
        jobService.updateJobStatus(Long.parseLong(userId), id, Job.JobStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(Map.of("message", "Job status updated"));
    }

    @DeleteMapping("/employer/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(
            @PathVariable Long id, @RequestHeader("X-User-Id") String userId) {
        jobService.deleteJob(Long.parseLong(userId), id);
        return ResponseEntity.ok(Map.of("message", "Job deleted"));
    }

    // ── INTERNAL (called by other services) ─────────────────────────────────
    @GetMapping("/internal/{jobId}")
    public ResponseEntity<Job> getJobInternal(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.findJobById(jobId));
    }

    @GetMapping("/internal/stats/{companyId}")
    public ResponseEntity<Map<String, Object>> getJobStats(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getJobStats(companyId));
    }

    private Long parseUserId(String userId) {
        if (userId != null && !userId.isBlank()) {
            try { return Long.parseLong(userId); } catch (Exception ignored) {}
        }
        return null;
    }
}
