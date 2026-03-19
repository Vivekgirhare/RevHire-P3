package com.revhire.job.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "application-service", fallback = ApplicationServiceClient.ApplicationServiceFallback.class)
public interface ApplicationServiceClient {

    @GetMapping("/api/applications/internal/check")
    Boolean checkApplied(@RequestParam("userId") Long userId, @RequestParam("jobId") Long jobId);

    @org.springframework.stereotype.Component
    class ApplicationServiceFallback implements ApplicationServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(ApplicationServiceFallback.class);

        @Override
        public Boolean checkApplied(Long userId, Long jobId) {
            logger.warn("Application service unavailable. Circuit breaker activated for checkApplied userId={}, jobId={}", userId, jobId);
            return false;
        }
    }
}
