package com.revhire.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ApplicationServiceApp {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationServiceApp.class);
    public static void main(String[] args) {
        SpringApplication.run(ApplicationServiceApp.class, args);
        logger.info("RevHire Application Service started on port 8083");
    }
}
