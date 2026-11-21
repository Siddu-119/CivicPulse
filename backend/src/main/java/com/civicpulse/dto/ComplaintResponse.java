package com.civicpulse.dto;

import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintPriority;
import com.civicpulse.entity.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ComplaintResponse(
        Long id,
        String trackingCode,
        String title,
        String description,
        ComplaintCategory category,
        ComplaintPriority priority,
        ComplaintStatus status,
        String address,
        String landmark,
        String ward,
        Double latitude,
        Double longitude,
        String imagePath,
        String citizenName,
        String citizenEmail,
        String citizenPhone,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        AssignmentResponse assignment,
        List<ComplaintUpdateResponse> updates,
        FeedbackResponse feedback
) {}
