package com.gymrat.controller;

import com.gymrat.model.User;
import com.gymrat.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        System.out.println("Received: " + user.getUsername() + ", " + user.getPassword());
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody User user) {
        User found = userRepository.findByUsername(user.getUsername());
        System.out.println("Login attempt: " + user.getUsername() + ", found: " + found);

        if (found != null && found.getPassword().equals(user.getPassword())) {
            return ResponseEntity.ok(found);
        }
        return ResponseEntity.status(401).build();
    }
}
