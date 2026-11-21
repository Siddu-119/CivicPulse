package com.civicpulse.dto;

import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintPriority;
import com.civicpulse.entity.ComplaintStatus;

import java.time.LocalDateTime;

public record MapComplaintResponse(
        Long id,
        String trackingCode,
        String title,
        ComplaintCategory category,
        ComplaintPriority priority,
        ComplaintStatus status,
        String address,
        String ward,
        Double latitude,
        Double longitude,
        String imagePath,
        LocalDateTime createdAt
) {}
