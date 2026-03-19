package com.revhire.profile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ProfileServiceApplication {
    private static final Logger logger = LoggerFactory.getLogger(ProfileServiceApplication.class);
    public static void main(String[] args) {
        SpringApplication.run(ProfileServiceApplication.class, args);
        logger.info("RevHire Profile Service started on port 8084");
    }
}
