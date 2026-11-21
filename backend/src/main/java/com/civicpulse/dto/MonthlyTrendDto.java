package com.civicpulse.dto;

public record MonthlyTrendDto(
        String month,
        long submitted,
        long resolved
) {}
