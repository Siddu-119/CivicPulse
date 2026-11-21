package com.civicpulse.dto;

import java.time.LocalDateTime;

public record AssignmentResponse(
        Long id,
        String department,
        String teamName,
        String officerName,
        String officerContact,
        String notes,
        String assignedByName,
        LocalDateTime assignedAt,
        LocalDateTime updatedAt
) {}
