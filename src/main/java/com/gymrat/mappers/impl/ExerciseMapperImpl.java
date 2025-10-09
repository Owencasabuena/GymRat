package com.gymrat.mappers.impl;

import com.gymrat.domain.dto.ExerciseDto;
import com.gymrat.domain.entities.Exercise;
import com.gymrat.mappers.ExerciseMapper;
import org.springframework.stereotype.Component;

@Component
public class ExerciseMapperImpl implements ExerciseMapper {
    @Override
    public Exercise fromDTO(ExerciseDto exerciseDto) {
        return new Exercise(
                exerciseDto.id(),
                exerciseDto.name(),
                exerciseDto.sets(),
                exerciseDto.reps(),
                exerciseDto.duration(),
                null
        );
    }

    @Override
    public ExerciseDto toDTO(Exercise exercise) {
        return new ExerciseDto(
                exercise.getId(),
                exercise.getName(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getDuration()
        );
    }
}
