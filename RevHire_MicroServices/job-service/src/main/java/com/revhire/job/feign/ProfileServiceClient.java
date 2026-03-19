package com.revhire.job.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "profile-service", fallback = ProfileServiceClient.ProfileServiceFallback.class)
public interface ProfileServiceClient {

    @GetMapping("/api/profile/internal/saved-check")
    Boolean checkSaved(@RequestParam("userId") Long userId, @RequestParam("jobId") Long jobId);

    @org.springframework.stereotype.Component
    class ProfileServiceFallback implements ProfileServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(ProfileServiceFallback.class);

        @Override
        public Boolean checkSaved(Long userId, Long jobId) {
            logger.warn("Profile service unavailable. Circuit breaker activated for checkSaved userId={}, jobId={}", userId, jobId);
            return false;
        }
    }
}
