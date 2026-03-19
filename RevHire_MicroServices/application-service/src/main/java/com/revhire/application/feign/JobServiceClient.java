package com.revhire.application.feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "job-service", fallback = JobServiceClient.JobServiceFallback.class)
public interface JobServiceClient {

    @GetMapping("/api/jobs/internal/{jobId}")
    Map<String, Object> getJobById(@PathVariable("jobId") Long jobId);

    @org.springframework.stereotype.Component
    class JobServiceFallback implements JobServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(JobServiceFallback.class);

        @Override
        public Map<String, Object> getJobById(Long jobId) {
            logger.error("Job service unavailable. Circuit breaker activated for getJobById jobId={}", jobId);
            return null;
        }
    }
}
