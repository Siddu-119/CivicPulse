package com.civicpulse.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {}
