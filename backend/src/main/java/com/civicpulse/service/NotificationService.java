package com.civicpulse.service;

import com.civicpulse.dto.NotificationResponse;
import com.civicpulse.dto.PagedResponse;
import com.civicpulse.entity.Complaint;
import com.civicpulse.entity.Notification;
import com.civicpulse.entity.User;
import com.civicpulse.repository.NotificationRepository;
import com.civicpulse.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyUser(User user, Complaint complaint, String title, String message, String type) {
        if (user == null) return;
        Notification n = new Notification();
        n.setUser(user);
        n.setComplaint(complaint);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type != null ? type : "STATUS_UPDATE");
        n.setRead(false);
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        Page<Notification> p = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return new PagedResponse<>(
                p.getContent().stream().map(this::toResponse).toList(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Notification n = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        n.setRead(true);
        return toResponse(notificationRepository.save(n));
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getComplaint() != null ? n.getComplaint().getId() : null,
                n.getComplaint() != null ? n.getComplaint().getTrackingCode() : null,
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
