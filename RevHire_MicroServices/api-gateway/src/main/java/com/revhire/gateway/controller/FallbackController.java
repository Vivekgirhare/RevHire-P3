package com.revhire.gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    private static final Logger logger = LoggerFactory.getLogger(FallbackController.class);

    @RequestMapping("/auth")
    public Mono<ResponseEntity<Map<String, String>>> authFallback() {
        logger.warn("Circuit breaker triggered for auth-service");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "503",
                        "message", "Auth Service is currently unavailable. Please try again later.",
                        "service", "auth-service"
                )));
    }

    @RequestMapping("/job")
    public Mono<ResponseEntity<Map<String, String>>> jobFallback() {
        logger.warn("Circuit breaker triggered for job-service");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "503",
                        "message", "Job Service is currently unavailable. Please try again later.",
                        "service", "job-service"
                )));
    }

    @RequestMapping("/application")
    public Mono<ResponseEntity<Map<String, String>>> applicationFallback() {
        logger.warn("Circuit breaker triggered for application-service");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "503",
                        "message", "Application Service is currently unavailable. Please try again later.",
                        "service", "application-service"
                )));
    }

    @RequestMapping("/profile")
    public Mono<ResponseEntity<Map<String, String>>> profileFallback() {
        logger.warn("Circuit breaker triggered for profile-service");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "503",
                        "message", "Profile Service is currently unavailable. Please try again later.",
                        "service", "profile-service"
                )));
    }

    @RequestMapping("/company")
    public Mono<ResponseEntity<Map<String, String>>> companyFallback() {
        logger.warn("Circuit breaker triggered for company-service");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "503",
                        "message", "Company Service is currently unavailable. Please try again later.",
                        "service", "company-service"
                )));
    }

    @RequestMapping("/notification")
    public Mono<ResponseEntity<Map<String, String>>> notificationFallback() {
        logger.warn("Circuit breaker triggered for notification-service");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "status", "503",
                        "message", "Notification Service is currently unavailable. Please try again later.",
                        "service", "notification-service"
                )));
    }
}
