package com.revhire.company.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "application-service", fallback = ApplicationServiceClient.ApplicationServiceFallback.class)
public interface ApplicationServiceClient {

    @GetMapping("/api/applications/internal/stats")
    Map<String, Object> getApplicationStats(@RequestParam("employerUserId") Long employerUserId);

    @org.springframework.stereotype.Component
    class ApplicationServiceFallback implements ApplicationServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(ApplicationServiceFallback.class);

        @Override
        public Map<String, Object> getApplicationStats(Long employerUserId) {
            logger.warn("Application service unavailable. Circuit breaker activated for getApplicationStats employerUserId={}", employerUserId);
            return Map.of("total", 0, "pending", 0);
        }
    }
}
