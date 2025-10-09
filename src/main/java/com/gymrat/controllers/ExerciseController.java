package com.gymrat.controllers;

import com.gymrat.domain.dto.ExerciseDto;
import com.gymrat.domain.entities.Exercise;
import com.gymrat.mappers.ExerciseMapper;
import com.gymrat.services.ExerciseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping(path = "/routine/{routine_id}/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final ExerciseMapper exerciseMapper;

    public ExerciseController(ExerciseService exerciseService, ExerciseMapper exerciseMapper) {
        this.exerciseService = exerciseService;
        this.exerciseMapper = exerciseMapper;
    }

    @GetMapping
    public List<ExerciseDto> listExercises(@PathVariable("routine_id") UUID routineId) {
        return exerciseService.listExercises(routineId)
                .stream()
                .map(exerciseMapper::toDTO)
                .toList();
    }

    @PostMapping
    public ExerciseDto createExercise(
            @PathVariable("routine_id") UUID routineId,
            @RequestBody ExerciseDto exerciseDto
    ) {
        Exercise createdExercise = exerciseService.createExercise(
                routineId,
                exerciseMapper.fromDTO(exerciseDto)
        );
        return exerciseMapper.toDTO(createdExercise);
    }

    @GetMapping(path = "/{exercise_id}")
    public Optional<ExerciseDto> getExercise(
            @PathVariable("routine_id") UUID routineId,
            @PathVariable("exercise_id") UUID exerciseId
    ) {
        return exerciseService.getExercise(routineId, exerciseId).map(exerciseMapper::toDTO);
    }

    @PutMapping(path = "/{exercise_id}")
    public ExerciseDto updateExercise(
            @PathVariable("routine_id") UUID routineId,
            @PathVariable("exercise_id") UUID exerciseId,
            @RequestBody ExerciseDto exerciseDto
    ) {
        Exercise updatedExercise = exerciseService.updateExercise(
                routineId,
                exerciseId,
                exerciseMapper.fromDTO(exerciseDto)
        );
        return exerciseMapper.toDTO(updatedExercise);
    }

    @DeleteMapping(path = "/{exercise_id}")
    public void deleteExercise(
            @PathVariable("routine_id") UUID routineId,
            @PathVariable("exercise_id") UUID exerciseId
    ) {
        exerciseService.deleteExercise(routineId, exerciseId);
    }
}
