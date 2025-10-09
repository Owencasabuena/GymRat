package com.gymrat.mappers;

import com.gymrat.domain.dto.ExerciseDto;
import com.gymrat.domain.entities.Exercise;

public interface ExerciseMapper {

    Exercise fromDTO(ExerciseDto exerciseDto);
    ExerciseDto toDTO(Exercise exercise);
}
