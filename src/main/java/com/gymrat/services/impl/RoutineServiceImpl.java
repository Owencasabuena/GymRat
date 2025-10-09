package com.gymrat.services.impl;

import com.gymrat.domain.entities.Routine;
import com.gymrat.repositories.RoutineRepository;
import com.gymrat.services.RoutineService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoutineServiceImpl implements RoutineService {

    private final RoutineRepository routineRepository;

    public RoutineServiceImpl(RoutineRepository routineRepository) {
        this.routineRepository = routineRepository;
    }

    @Override
    public List<Routine> listRoutines() {
        return routineRepository.findAll();
    }

    @Override
    public Routine createRoutine(Routine routine) {
        if(null != routine.getId()) {
            throw new IllegalArgumentException("Routine already has an ID!");
        }

        if(null == routine.getName() || routine.getName().isBlank()) {
            throw new IllegalArgumentException("Routine name is required");
        }

        return routineRepository.save(new Routine(
                null,
                routine.getName(),
                routine.getDescription(),
                null
        ));
    }

    @Override
    public Optional<Routine> getRoutine(UUID id) {
        return routineRepository.findById(id);
    }

    @Override
    public Routine updateRoutine(UUID routineId, Routine routine) {
        if(null == routine.getId()) {
            throw new IllegalArgumentException("Routine must have an ID");
        }

        if(!Objects.equals(routine.getId(), routineId)) {
            throw new IllegalArgumentException("Attemptiong to change routine ID, this is not permitted");
        }

        Routine existingRoutine = routineRepository.findById(routineId).orElseThrow(() ->
                new IllegalArgumentException("Routine not found"));

        existingRoutine.setName(routine.getName());
        existingRoutine.setDescription(routine.getDescription());
        return routineRepository.save(existingRoutine);
    }

    @Override
    public void deleteRoutine(UUID routineId) {
        routineRepository.deleteById(routineId);
    }
}
