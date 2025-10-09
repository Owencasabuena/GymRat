package com.gymrat.mappers.impl;

import com.gymrat.domain.dto.RoutineDto;
import com.gymrat.domain.entities.Routine;
import com.gymrat.mappers.ExerciseMapper;
import com.gymrat.mappers.RoutineMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class RoutineMapperImpl implements RoutineMapper {

    private final ExerciseMapper exerciseMapper;

    public RoutineMapperImpl(ExerciseMapper exerciseMapper) {
        this.exerciseMapper = exerciseMapper;
    }

    @Override
    public Routine fromDTO(RoutineDto routineDto) {
        return new Routine(
                routineDto.id(),
                routineDto.name(),
                routineDto.description(),
                Optional.ofNullable(routineDto.exercises())
                        .map(exercises -> exercises.stream()
                                .map(exerciseMapper::fromDTO)
                                .toList()
                        ).orElse(null)
        );
    }

    @Override
    public RoutineDto toDTO(Routine routine) {
        return new RoutineDto(
                routine.getId(),
                routine.getName(),
                routine.getDescription(),
                Optional.ofNullable(routine.getExercises())
                        .map(exercises -> exercises.stream()
                                .map(exerciseMapper::toDTO)
                                .toList()
                        ).orElse(null)
        );
    }
}
