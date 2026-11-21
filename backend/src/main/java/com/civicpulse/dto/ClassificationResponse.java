package com.civicpulse.dto;

import com.civicpulse.entity.ComplaintCategory;
import com.civicpulse.entity.ComplaintPriority;

import java.util.List;

public record ClassificationResponse(
        ComplaintCategory category,
        ComplaintPriority priority,
        String department,
        double confidenceScore,
        List<String> detectedKeywords,
        String reason
) {}
