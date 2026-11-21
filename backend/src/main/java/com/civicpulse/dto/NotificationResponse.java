package com.civicpulse.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long complaintId,
        String trackingCode,
        String title,
        String message,
        String type,
        boolean read,
        LocalDateTime createdAt
) {}
