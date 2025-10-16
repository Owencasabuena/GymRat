package com.gymrat.services;

import com.gymrat.domain.dto.AuthResponse;
import com.gymrat.domain.dto.LoginRequest;
import com.gymrat.domain.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
