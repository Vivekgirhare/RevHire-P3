package com.revhire.application.feign;

import com.revhire.application.dto.ApplicationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", fallback = NotificationServiceClient.NotificationServiceFallback.class)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/internal/create")
    void createNotification(@RequestBody ApplicationDto.CreateNotificationRequest request);

    @org.springframework.stereotype.Component
    class NotificationServiceFallback implements NotificationServiceClient {
        private static final Logger logger = LoggerFactory.getLogger(NotificationServiceFallback.class);

        @Override
        public void createNotification(ApplicationDto.CreateNotificationRequest request) {
            logger.error("Notification service unavailable. Circuit breaker activated. Notification dropped for userId={}",
                    request.getUserId());
        }
    }
}
