package com.gymrat.controller;

import com.gymrat.model.Program;
import com.gymrat.repository.ProgramRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/programs")
public class ProgramController {
    private ProgramRepository programRepository;

    @GetMapping("/user/{userId}")
    public List<Program> getUserPrograms(@PathVariable Long userId) {
        return programRepository.findByUserId(userId);
    }

    @PostMapping
    public Program addProgram(@RequestBody Program program) {
        return programRepository.save(program);
    }

    @PutMapping("/{id}")
    public Program editProgram(@PathVariable Long id, @RequestBody Program updated) {
        Program program = programRepository.findById(id).orElseThrow();
        program.setName(updated.getName());
        return programRepository.save(program);
    }

    @DeleteMapping("/{id}")
    public void deleteProgram(@PathVariable Long id) {
        programRepository.deleteById(id);
    }
}
