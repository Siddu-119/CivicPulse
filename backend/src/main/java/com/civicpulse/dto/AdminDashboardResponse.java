package com.civicpulse.dto;

import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
        long totalComplaints,
        long pendingComplaints,
        long assignedComplaints,
        long inProgressComplaints,
        long resolvedComplaints,
        long rejectedComplaints,
        double averageRating,
        Map<String, Long> categoryBreakdown,
        List<FeedbackResponse> recentFeedback
) {}
