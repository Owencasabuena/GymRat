package com.gymrat.services.impl;

import com.gymrat.domain.entities.Exercise;
import com.gymrat.domain.entities.Routine;
import com.gymrat.repositories.ExerciseRepository;
import com.gymrat.repositories.RoutineRepository;
import com.gymrat.services.ExerciseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final RoutineRepository routineRepository;

    public ExerciseServiceImpl(ExerciseRepository exerciseRepository, RoutineRepository routineRepository) {
        this.exerciseRepository = exerciseRepository;
        this.routineRepository = routineRepository;
    }

    @Override
    public List<Exercise> listExercises(UUID routineId) {
        return exerciseRepository.findByRoutineId(routineId);
    }

    @Override
    public Exercise createExercise(UUID routineId, Exercise exercise) {
        if(null != exercise.getId()) {
            throw new IllegalArgumentException("Exercise already has an ID");
        }
        if(null == exercise.getName() || exercise.getName().isBlank()) {
            throw new IllegalArgumentException("Exercise must have a name");
        }

        boolean hasReps = exercise.getReps() != null && exercise.getReps() > 0;
        boolean hasDuration = exercise.getDuration() != null && exercise.getDuration() > 0;

        if (!hasReps && !hasDuration) {
            throw new IllegalArgumentException("Exercise must have either reps or duration");
        }

        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new IllegalArgumentException("Routine not found"));

        Exercise exerciseToSave = new Exercise(
                null,
                exercise.getName(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getDuration(),
                routine
        );

        return exerciseRepository.save(exerciseToSave);
    }

    @Override
    public Optional<Exercise> getExercise(UUID routineId, UUID exerciseId) {
        return exerciseRepository.findByRoutineIdAndId(routineId, exerciseId);
    }

    @Override
    public Exercise updateExercise(UUID routineId, UUID exerciseId, Exercise exercise) {
        if(null == exercise.getId()) {
            throw new IllegalArgumentException("Exercise must have an ID");
        }

        if(!Objects.equals(exerciseId, exercise.getId())) {
            throw new IllegalArgumentException("Exercise IDs do not match");
        }

        if (exercise.getSets() == null || exercise.getSets() <= 0) {
            throw new IllegalArgumentException("Sets must be greater than 0");
        }

        boolean hasReps = exercise.getReps() != null && exercise.getReps() > 0;
        boolean hasDuration = exercise.getDuration() != null && exercise.getDuration() > 0;

        if (!hasReps && !hasDuration) {
            throw new IllegalArgumentException("Exercise must have either reps or duration");
        }

        Exercise existingExercise = exerciseRepository.findByRoutineIdAndId(routineId, exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        existingExercise.setName(exercise.getName());
        existingExercise.setSets(exercise.getSets());
        existingExercise.setReps(exercise.getReps());
        existingExercise.setDuration(exercise.getDuration());

        return exerciseRepository.save(existingExercise);
    }

    @Transactional
    @Override
    public void deleteExercise(UUID routineId, UUID exerciseId) {
        exerciseRepository.deleteByRoutineIdAndId(routineId, exerciseId);
    }
}
