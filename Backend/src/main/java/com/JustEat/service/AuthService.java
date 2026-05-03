package com.JustEat.service;

import com.JustEat.dto.request.ForgotPasswordRequest;
import com.JustEat.dto.request.ResetPasswordRequest;
import com.JustEat.dto.response.AuthResponse;
import com.JustEat.dto.request.LoginRequest;
import com.JustEat.dto.request.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
