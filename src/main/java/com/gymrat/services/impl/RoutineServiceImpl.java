package com.gymrat.services.impl;

import com.gymrat.domain.entities.Routine;
import com.gymrat.domain.entities.User;
import com.gymrat.repositories.RoutineRepository;
import com.gymrat.services.RoutineService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        return (User) authentication.getPrincipal();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Routine> listRoutines() {
        User currentUser = getCurrentUser();
        return routineRepository.findByUserId(currentUser.getId());
    }

    @Override
    @Transactional
    public Routine createRoutine(Routine routine) {
        if(null != routine.getId()) {
            throw new IllegalArgumentException("Routine already has an ID!");
        }

        if(null == routine.getName() || routine.getName().isBlank()) {
            throw new IllegalArgumentException("Routine name is required");
        }

        User currentUser = getCurrentUser();

        return routineRepository.save(new Routine(
                null,
                routine.getName(),
                routine.getDescription(),
                currentUser.getId(),
                null
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Routine> getRoutine(UUID id) {
        User currentUser = getCurrentUser();
        return routineRepository.findById(id)
                .filter(routine -> routine.getUserId().equals(currentUser.getId()));
    }

    @Override
    @Transactional
    public Routine updateRoutine(UUID routineId, Routine routine) {
        if(null == routine.getId()) {
            throw new IllegalArgumentException("Routine must have an ID");
        }

        if(!Objects.equals(routine.getId(), routineId)) {
            throw new IllegalArgumentException("Attempting to change routine ID, this is not permitted");
        }

        User currentUser = getCurrentUser();

        Routine existingRoutine = routineRepository.findById(routineId)
                .filter(r -> r.getUserId().equals(currentUser.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Routine not found or unauthorized"));

        existingRoutine.setName(routine.getName());
        existingRoutine.setDescription(routine.getDescription());
        return routineRepository.save(existingRoutine);
    }

    @Override
    @Transactional
    public void deleteRoutine(UUID routineId) {
        User currentUser = getCurrentUser();
        routineRepository.findById(routineId)
                .filter(r -> r.getUserId().equals(currentUser.getId()))
                .ifPresent(routineRepository::delete);
    }
}