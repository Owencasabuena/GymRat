package com.gymrat.domain.dto;

import java.util.List;
import java.util.UUID;

public record RoutineDto(
        UUID id,
        String name,
        String description,
        List<ExerciseDto> exercises
) {
}
