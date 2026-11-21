package com.civicpulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssignComplaintRequest(
        @NotBlank(message = "Department is required")
        @Size(max = 140)
        String department,

        @NotBlank(message = "Team name is required")
        @Size(max = 140)
        String teamName,

        @Size(max = 120)
        String officerName,

        @Size(max = 40)
        String officerContact,

        @Size(max = 1000)
        String notes
) {}
