package com.gymrat.services;

import com.gymrat.domain.entities.Exercise;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExerciseService {
    List<Exercise> listExercises(UUID routineId);
    Exercise createExercise(UUID routineId, Exercise exercise);
    Optional<Exercise> getExercise(UUID routineId, UUID exerciseId);
    Exercise updateExercise(UUID routineId, UUID exerciseId, Exercise exercise);
    void deleteExercise(UUID routineId, UUID exerciseId);
}
