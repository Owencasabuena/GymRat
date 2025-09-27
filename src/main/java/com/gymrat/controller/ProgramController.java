package com.gymrat.controller;

import com.gymrat.model.Program;
import com.gymrat.repository.ProgramRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/programs")
public class ProgramController {
    private final ProgramRepository programRepository;

     public ProgramController(ProgramRepository programRepository) {
         this.programRepository = programRepository;
     }

     @GetMapping
     public List<Program> getAllPrograms() {
         return programRepository.findAll();
     }

     public Program createProgram(@RequestBody Program program) {
         return programRepository.save(program);
     }
}
