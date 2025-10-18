package com.gymrat.controllers;

import com.gymrat.domain.dto.ChangePasswordRequest;
import com.gymrat.domain.dto.LoginRequest;
import com.gymrat.domain.dto.RegisterRequest;
import com.gymrat.domain.dto.AuthResponse;
import com.gymrat.domain.dto.UpdateProfileRequest;
import com.gymrat.domain.entities.User;
import com.gymrat.repositories.UserRepository;
import com.gymrat.security.JwtUtil;
import com.gymrat.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(
            AuthService authService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        // Verify current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PutMapping("/update-profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        // Check if email is being changed and if it's already taken
        if (!user.getEmail().equals(request.email())) {
            if (userRepository.findByEmail(request.email()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(null);
            }
        }

        // Update user info
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());

        User updatedUser = userRepository.save(user);

        // Generate new token with updated info
        String token = jwtUtil.generateToken(updatedUser.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                updatedUser.getEmail(),
                updatedUser.getFirstName(),
                updatedUser.getLastName(),
                updatedUser.getId()
        );

        return ResponseEntity.ok(response);
    }
}