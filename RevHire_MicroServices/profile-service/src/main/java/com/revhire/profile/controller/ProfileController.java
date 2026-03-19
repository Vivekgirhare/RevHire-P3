package com.revhire.profile.controller;

import com.revhire.profile.dto.ProfileDto;
import com.revhire.profile.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileDto.ProfileResponse> getProfile(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(profileService.getProfile(Long.valueOf(userId)));
    }

    @PutMapping
    public ResponseEntity<ProfileDto.ProfileResponse> updateProfile(
            @RequestBody ProfileDto.UpdateProfileRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(profileService.updateProfile(Long.valueOf(userId), request));
    }

    @PostMapping("/resume")
    public ResponseEntity<Map<String, String>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") String userId) throws IOException {
        String filename = profileService.uploadResume(Long.valueOf(userId), file);
        return ResponseEntity.ok(Map.of("message", "Resume uploaded", "filename", filename));
    }

    // ── SAVED JOBS ─────────────────────────────────────────────────────────
    @GetMapping("/seeker/saved-jobs")
    public ResponseEntity<List<Map<String, Object>>> getSavedJobs(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(profileService.getSavedJobs(Long.valueOf(userId)));
    }

    @PostMapping("/seeker/saved-jobs/{jobId}")
    public ResponseEntity<Map<String, String>> saveJob(
            @PathVariable Long jobId,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {
        String jobTitle     = body != null ? body.getOrDefault("jobTitle",     "") : "";
        String companyName  = body != null ? body.getOrDefault("companyName",  "") : "";
        String jobLocation  = body != null ? body.getOrDefault("jobLocation",  "") : "";
        String jobType      = body != null ? body.getOrDefault("jobType",      "") : "";
        profileService.saveJob(Long.valueOf(userId), jobId, jobTitle, companyName, jobLocation, jobType);
        return ResponseEntity.ok(Map.of("message", "Job saved"));
    }

    @DeleteMapping("/seeker/saved-jobs/{jobId}")
    public ResponseEntity<Map<String, String>> unsaveJob(
            @PathVariable Long jobId, @RequestHeader("X-User-Id") String userId) {
        profileService.unsaveJob(Long.valueOf(userId), jobId);
        return ResponseEntity.ok(Map.of("message", "Job unsaved"));
    }

    // ── INTERNAL ───────────────────────────────────────────────────────────
    @PostMapping("/internal/create")
    public ResponseEntity<Void> createProfile(@RequestBody ProfileDto.CreateProfileRequest request) {
        profileService.createProfile(request.getUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/internal/{userId}")
    public ResponseEntity<Map<String, Object>> getProfileInternal(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfileInternal(userId));
    }

    @GetMapping("/internal/saved-check")
    public ResponseEntity<Boolean> checkSaved(@RequestParam Long userId, @RequestParam Long jobId) {
        return ResponseEntity.ok(profileService.checkSaved(userId, jobId));
    }
}
