package com.JustEat.controller;

import com.JustEat.dto.request.ForgotPasswordRequest;
import com.JustEat.dto.request.ResetPasswordRequest;
import com.JustEat.dto.response.AuthResponse;
import com.JustEat.dto.request.LoginRequest;
import com.JustEat.dto.request.RegisterRequest;
import com.JustEat.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    // POST /auth/register — registers a new user account
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request){
        authService.register(request);
        return "User registered successfully";
    }

    // POST /auth/login — validates credentials and returns a JWT token
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }

    // POST /auth/forgot-password — sends a password reset email to the provided address
    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody ForgotPasswordRequest request){
        authService.forgotPassword(request);
    }

    // POST /auth/reset-password — resets the user's password using a valid one-time token
    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody ResetPasswordRequest request){
        authService.resetPassword(request);
    }

}
