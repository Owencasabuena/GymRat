package com.gymrat.controller;

import com.gymrat.model.Routine;
import com.gymrat.repository.RoutineRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routines")
public class RoutineController {
    private final RoutineRepository routineRepository;

    public RoutineController(RoutineRepository routineRepository) {
        this.routineRepository = routineRepository;
    }

    @GetMapping
    public List<Routine> getAllroutines() {
        return routineRepository.findAll();
    }

    @PostMapping
    public Routine createRoutine(Routine routine) {
        return routineRepository.save(routine);
    }
}
