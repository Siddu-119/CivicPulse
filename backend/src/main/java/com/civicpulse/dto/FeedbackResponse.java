package com.civicpulse.dto;

import java.time.LocalDateTime;

public record FeedbackResponse(
        Long id,
        Integer rating,
        String comment,
        String citizenName,
        String trackingCode,
        String complaintTitle,
        LocalDateTime createdAt
) {}
