package com.gymrat.domain.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {}