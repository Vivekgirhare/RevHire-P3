package com.revhire.auth.feign;

import com.revhire.auth.dto.AuthDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "company-service", fallback = CompanyServiceClient.CompanyServiceFallback.class)
public interface CompanyServiceClient {

    @PostMapping("/api/company/internal/create")
    void createCompany(@RequestBody AuthDto.CreateCompanyRequest request);

    @PutMapping("/api/auth/internal/users/{userId}/basic")
    void updateUserBasic(@PathVariable("userId") Long userId, @RequestBody Map<String, String> body);

    @org.springframework.stereotype.Component
    class CompanyServiceFallback implements CompanyServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(CompanyServiceFallback.class);

        @Override
        public void createCompany(AuthDto.CreateCompanyRequest request) {
            logger.error("Company service unavailable. Circuit breaker activated for createCompany userId={}",
                    request.getUserId());
            throw new RuntimeException("Company service is currently unavailable. Please try again later.");
        }

        @Override
        public void updateUserBasic(Long userId, Map<String, String> body) {
            logger.warn("Company service unavailable. Could not sync basic info for userId={}", userId);
        }
    }
}
