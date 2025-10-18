package com.gymrat.domain.dto;

public record UpdateProfileRequest(
        String firstName,
        String lastName,
        String email
) {}