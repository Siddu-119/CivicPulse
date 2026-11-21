package com.civicpulse.dto;

import com.civicpulse.entity.Role;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String ward,
        Role role,
        LocalDateTime createdAt
) {}
