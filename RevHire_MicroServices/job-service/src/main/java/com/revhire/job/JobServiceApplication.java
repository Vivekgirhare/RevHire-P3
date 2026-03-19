package com.revhire.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class JobServiceApplication {
    private static final Logger logger = LoggerFactory.getLogger(JobServiceApplication.class);
    public static void main(String[] args) {
        SpringApplication.run(JobServiceApplication.class, args);
        logger.info("RevHire Job Service started on port 8082");
    }
}
