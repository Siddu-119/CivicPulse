package com.civicpulse.dto;

import java.util.List;
import java.util.Map;

public record AdminAnalyticsResponse(
        long totalComplaints,
        long resolvedComplaints,
        long pendingComplaints,
        long assignedComplaints,
        long inProgressComplaints,
        long rejectedComplaints,
        double resolutionRate,
        double averageRating,
        double averageResolutionHours,
        Map<String, Long> categoryDistribution,
        Map<String, Long> priorityDistribution,
        Map<String, Long> departmentWorkload,
        Map<String, Long> statusDistribution,
        List<MonthlyTrendDto> monthlyTrends
) {}
