package com.revhire.auth.feign;

import com.revhire.auth.dto.AuthDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "profile-service", fallback = ProfileServiceClient.ProfileServiceFallback.class)
public interface ProfileServiceClient {

    @PostMapping("/api/profile/internal/create")
    @CircuitBreaker(name = "profileService", fallbackMethod = "createProfileFallback")
    void createProfile(@RequestBody AuthDto.CreateProfileRequest request);

    @org.springframework.stereotype.Component
    class ProfileServiceFallback implements ProfileServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(ProfileServiceFallback.class);

        @Override
        public void createProfile(AuthDto.CreateProfileRequest request) {
            logger.error("Profile service unavailable. Circuit breaker activated for createProfile userId={}",
                    request.getUserId());
            throw new RuntimeException("Profile service is currently unavailable. Please try again later.");
        }
    }
}
