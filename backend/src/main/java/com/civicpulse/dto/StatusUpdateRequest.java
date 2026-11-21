package com.civicpulse.dto;

import com.civicpulse.entity.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        ComplaintStatus status,

        @NotBlank(message = "Official remark is required")
        @Size(max = 1500)
        String remark
) {}
