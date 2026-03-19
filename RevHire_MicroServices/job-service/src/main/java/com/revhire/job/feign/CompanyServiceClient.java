package com.revhire.job.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "company-service", fallback = CompanyServiceClient.CompanyServiceFallback.class)
public interface CompanyServiceClient {

    @GetMapping("/api/company/internal/by-user/{userId}")
    Map<String, Object> getCompanyByUser(@PathVariable("userId") Long userId);

    @org.springframework.stereotype.Component
    class CompanyServiceFallback implements CompanyServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(CompanyServiceFallback.class);

        @Override
        public Map<String, Object> getCompanyByUser(Long userId) {
            logger.error("Company service unavailable. Circuit breaker activated for getCompanyByUser userId={}", userId);
            return null;
        }
    }
}
