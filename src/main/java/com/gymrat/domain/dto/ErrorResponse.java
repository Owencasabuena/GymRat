package com.gymrat.domain.dto;

public record ErrorResponse(
        int status,
        String message,
        String details
) {
}
