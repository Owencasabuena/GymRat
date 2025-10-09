package com.gymrat.controllers;

import com.gymrat.domain.dto.RoutineDto;
import com.gymrat.domain.entities.Routine;
import com.gymrat.mappers.RoutineMapper;
import com.gymrat.services.RoutineService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping(path = "/routines")
public class RoutineController {

    private final RoutineService routineService;
    private final RoutineMapper routineMapper;

    public RoutineController(RoutineService routineService, RoutineMapper routineMapper) {
        this.routineService = routineService;
        this.routineMapper = routineMapper;
    }

    @GetMapping
    public List<RoutineDto> listRoutines() {
        return routineService.listRoutines()
                .stream()
                .map(routineMapper::toDTO)
                .toList();
    }

    @PostMapping
    public RoutineDto createRoutine(@RequestBody RoutineDto routineDto) {
        Routine createdRoutine = routineService.createRoutine(
                routineMapper.fromDTO(routineDto)
        );
        return routineMapper.toDTO(createdRoutine);
    }

    @GetMapping(path = "/{routine_id}")
    public Optional<RoutineDto> getRoutine(@PathVariable("routine_id") UUID routineId) {
        return routineService.getRoutine(routineId).map(routineMapper::toDTO);
    }

    @PutMapping(path = "/{routine_id}")
    public RoutineDto updateRoutine(
            @PathVariable("routine_id") UUID routineId,
            @RequestBody RoutineDto routineDto
    ) {
        Routine updatedRoutine = routineService.updateRoutine(
                routineId,
                routineMapper.fromDTO(routineDto)
        );

        return routineMapper.toDTO(updatedRoutine);
    }

    @DeleteMapping(path = "/{routine_id}")
    public void deleteRoutine(@PathVariable("routine_id") UUID routineId) {
        routineService.deleteRoutine(routineId);
    }
}
