package com.revhire.profile.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.Map;

@FeignClient(name = "auth-service", fallback = AuthServiceClient.AuthServiceFallback.class)
public interface AuthServiceClient {

    @PutMapping("/api/auth/internal/users/{userId}/basic")
    void updateUserBasic(@PathVariable("userId") Long userId, @RequestBody Map<String, String> body);

    @GetMapping("/api/auth/internal/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);

    @org.springframework.stereotype.Component
    class AuthServiceFallback implements AuthServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(AuthServiceFallback.class);

        @Override
        public void updateUserBasic(Long userId, Map<String, String> body) {
            logger.warn("Auth service unavailable. Could not sync basic info for userId={}", userId);
        }

        @Override
        public Map<String, Object> getUserById(Long userId) {
            logger.warn("Auth service unavailable. Could not fetch user data for userId={}", userId);
            return new HashMap<>();
        }
    }
}