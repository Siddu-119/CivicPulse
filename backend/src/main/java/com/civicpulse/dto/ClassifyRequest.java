package com.civicpulse.dto;

import jakarta.validation.constraints.NotBlank;

public record ClassifyRequest(
        @NotBlank(message = "Title is required") String title,
        String description
) {}
