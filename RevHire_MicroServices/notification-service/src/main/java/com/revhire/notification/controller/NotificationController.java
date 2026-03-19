package com.revhire.notification.controller;

import com.revhire.notification.dto.NotificationDto;
import com.revhire.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto.NotificationResponse>> getNotifications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(Long.parseLong(userId)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(Long.parseLong(userId))));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestHeader("X-User-Id") String userId) {
        notificationService.markAllAsRead(Long.parseLong(userId));
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id, @RequestHeader("X-User-Id") String userId) {
        notificationService.markAsRead(id, Long.parseLong(userId));
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    // ── INTERNAL (called by Application Service) ──────────────────────────
    @PostMapping("/internal/create")
    public ResponseEntity<Void> createNotification(@RequestBody NotificationDto.CreateRequest request) {
        notificationService.createNotification(request);
        return ResponseEntity.ok().build();
    }
}
