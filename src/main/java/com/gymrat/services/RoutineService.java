package com.gymrat.services;

import com.gymrat.domain.entities.Routine;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoutineService {
    List<Routine> listRoutines();
    Routine createRoutine(Routine routine);
    Optional<Routine> getRoutine(UUID id);
    Routine updateRoutine(UUID routineId, Routine routine);
    void deleteRoutine(UUID routineId);
}
