package com.revhire.company.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "job-service", fallback = JobServiceClient.JobServiceFallback.class)
public interface JobServiceClient {

    @GetMapping("/api/jobs/internal/stats/{companyId}")
    Map<String, Object> getJobStats(@PathVariable("companyId") Long companyId);

    @org.springframework.stereotype.Component
    class JobServiceFallback implements JobServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(JobServiceFallback.class);

        @Override
        public Map<String, Object> getJobStats(Long companyId) {
            logger.warn("Job service unavailable. Circuit breaker activated for getJobStats companyId={}", companyId);
            return Map.of("totalJobs", 0, "activeJobs", 0);
        }
    }
}
