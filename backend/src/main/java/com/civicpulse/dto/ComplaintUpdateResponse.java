package com.civicpulse.dto;

import com.civicpulse.entity.ComplaintStatus;
import java.time.LocalDateTime;

public record ComplaintUpdateResponse(
        Long id,
        ComplaintStatus status,
        String remark,
        String updatedByName,
        LocalDateTime createdAt
) {}
