package com.revhire.application.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "profile-service", fallback = ProfileServiceClient.ProfileServiceFallback.class)
public interface ProfileServiceClient {

    @GetMapping("/api/profile/internal/{userId}")
    Map<String, Object> getProfileInternal(@PathVariable("userId") Long userId);

    @org.springframework.stereotype.Component
    class ProfileServiceFallback implements ProfileServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(ProfileServiceFallback.class);

        @Override
        public Map<String, Object> getProfileInternal(Long userId) {
            logger.warn("Profile service unavailable. Circuit breaker activated for getProfileInternal userId={}", userId);
            return null;
        }
    }
}
