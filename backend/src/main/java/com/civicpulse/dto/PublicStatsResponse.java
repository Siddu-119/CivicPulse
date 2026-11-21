package com.civicpulse.dto;

public record PublicStatsResponse(
        long totalComplaints,
        long resolvedComplaints,
        long activeComplaints,
        double averageRating
) {}
