package com.revhire.notification.service;

import com.revhire.notification.dto.NotificationDto;
import com.revhire.notification.entity.Notification;
import com.revhire.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    @Autowired private NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(NotificationDto.CreateRequest req) {
        Notification n = new Notification();
        n.setUserId(req.getUserId()); n.setTitle(req.getTitle()); n.setMessage(req.getMessage());
        n.setReferenceId(req.getReferenceId()); n.setRead(false);
        try   { n.setType(Notification.NotificationType.valueOf(req.getType())); }
        catch (Exception e) { n.setType(Notification.NotificationType.GENERAL); }
        notificationRepository.save(n);
        logger.debug("Notification created for userId: {}", req.getUserId());
    }

    public List<NotificationDto.NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) { n.setRead(true); notificationRepository.save(n); }
        });
    }

    private NotificationDto.NotificationResponse mapToResponse(Notification n) {
        NotificationDto.NotificationResponse r = new NotificationDto.NotificationResponse();
        r.setId(n.getId()); r.setTitle(n.getTitle()); r.setMessage(n.getMessage());
        r.setType(n.getType()); r.setRead(n.isRead()); r.setCreatedAt(n.getCreatedAt());
        r.setReferenceId(n.getReferenceId());
        return r;
    }
}
