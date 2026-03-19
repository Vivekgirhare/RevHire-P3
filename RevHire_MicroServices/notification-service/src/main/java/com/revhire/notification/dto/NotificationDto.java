package com.revhire.notification.dto;

import com.revhire.notification.entity.Notification;
import lombok.Data;
import java.time.LocalDateTime;

public class NotificationDto {

    @Data public static class CreateRequest {
        private Long   userId;
        private String title;
        private String message;
        private String type;
        private Long   referenceId;
    }

    @Data public static class NotificationResponse {
        private Long                       id;
        private String                     title;
        private String                     message;
        private Notification.NotificationType type;
        private boolean                    read;
        private LocalDateTime              createdAt;
        private Long                       referenceId;
    }
}
