package com.civicpulse.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FeedbackRequest(
        @NotNull(message = "Rating is required")
        @Min(1)
        @Max(5)
        Integer rating,

        @Size(max = 1000)
        String comment
) {}
