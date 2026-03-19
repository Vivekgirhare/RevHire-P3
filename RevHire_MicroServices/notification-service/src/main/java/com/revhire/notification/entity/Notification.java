package com.revhire.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false) private Long userId;

    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT", nullable = false) private String message;

    @Enumerated(EnumType.STRING) private NotificationType type;
    @Column(name = "is_read") private boolean read = false;

    @Column(name = "created_at") private LocalDateTime createdAt;
    private Long referenceId;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum NotificationType { APPLICATION_STATUS, JOB_RECOMMENDATION, GENERAL }
}
