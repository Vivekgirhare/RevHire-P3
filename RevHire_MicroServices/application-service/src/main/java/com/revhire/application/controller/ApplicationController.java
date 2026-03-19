package com.revhire.application.controller;

import com.revhire.application.dto.ApplicationDto;
import com.revhire.application.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired private ApplicationService applicationService;

    // ── SEEKER ────────────────────────────────────────────────────────────
    @PostMapping("/seeker/apply")
    public ResponseEntity<ApplicationDto.ApplicationResponse> apply(
            @RequestBody ApplicationDto.ApplyRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(applicationService.apply(Long.parseLong(userId), request));
    }

    @GetMapping("/seeker/my-applications")
    public ResponseEntity<List<ApplicationDto.ApplicationResponse>> getMyApplications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(applicationService.getSeekerApplications(Long.parseLong(userId)));
    }

    @PatchMapping("/seeker/{id}/withdraw")
    public ResponseEntity<Map<String, String>> withdraw(
            @PathVariable Long id,
            @RequestBody(required = false) ApplicationDto.WithdrawRequest request,
            @RequestHeader("X-User-Id") String userId) {
        applicationService.withdraw(Long.parseLong(userId), id,
                request != null ? request.getReason() : null);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn"));
    }

    // ── EMPLOYER ──────────────────────────────────────────────────────────
    @GetMapping("/employer/job/{jobId}")
    public ResponseEntity<List<ApplicationDto.ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(applicationService.getJobApplications(Long.parseLong(userId), jobId));
    }

    @PatchMapping("/employer/{id}/status")
    public ResponseEntity<ApplicationDto.ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ApplicationDto.StatusUpdateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(applicationService.updateStatus(Long.parseLong(userId), id, request));
    }

    // ── INTERNAL ──────────────────────────────────────────────────────────
    @GetMapping("/internal/check")
    public ResponseEntity<Boolean> checkApplied(@RequestParam Long userId, @RequestParam Long jobId) {
        return ResponseEntity.ok(applicationService.checkApplied(userId, jobId));
    }

    @GetMapping("/internal/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam Long employerUserId) {
        return ResponseEntity.ok(applicationService.getStats(employerUserId));
    }
}
