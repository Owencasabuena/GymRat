package com.gymrat.domain.dto;

import jakarta.persistence.criteria.CriteriaBuilder;

import java.util.UUID;

public record ExerciseDto(
        UUID id,
        String name,
        Integer sets,
        Integer reps,
        Integer duration
) {
}
