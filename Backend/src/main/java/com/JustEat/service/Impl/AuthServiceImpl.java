package com.JustEat.service.Impl;


import com.JustEat.dto.request.ForgotPasswordRequest;
import com.JustEat.dto.request.ResetPasswordRequest;
import com.JustEat.dto.response.AuthResponse;
import com.JustEat.dto.request.LoginRequest;
import com.JustEat.dto.request.RegisterRequest;
import com.JustEat.entity.PasswordResetToken;
import com.JustEat.entity.User;
import com.JustEat.enums.Role;
import com.JustEat.exception.BadRequestException;
import com.JustEat.exception.NotFoundException;
import com.JustEat.repository.PasswordResetTokenRepository;
import com.JustEat.repository.UserRepository;
import com.JustEat.security.JwtUtil;
import com.JustEat.service.AuthService;
import com.JustEat.service.helper.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private  final JwtUtil jwtUtil;

    public void register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new BadRequestException("Email already exists");
        }
        validatePassword(request.getPassword());
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getRole() != Role.CUSTOMER && request.getRole() != Role.OWNER) {
            throw new BadRequestException("Invalid role selection");
        }
        user.setRole(request.getRole());
        user.setLocation(request.getLocation());
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        if(request.getProfileImageUrl()!=null){
            user.setProfileImageUrl(request.getProfileImageUrl());
        }
        userRepository.save(user);
    }
    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new BadRequestException("Wrong email or password"));

        if(!passwordEncoder.matches(request.getPassword(),user.getPasswordHash())){
            throw new BadRequestException("Wrong email or password");
        }
        String token= jwtUtil.generateToken(user.getPublicId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getPublicId())
                .location(user.getLocation() != null ? user.getLocation().name() : null)
                .build();
    }

    @Transactional
    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if(user != null){
            passwordResetTokenRepository.deleteAllByUser(user);

            String rawToken = UUID.randomUUID().toString();
            String tokenHash = passwordEncoder.encode(rawToken);

            PasswordResetToken token = new PasswordResetToken();
            token.setTokenHash(tokenHash);
            token.setUser(user);
            token.setUsed(false);
            token.setExpiryDate(LocalDateTime.now().plusMinutes(15));

            passwordResetTokenRepository.save(token);
            emailService.sendPasswordResetEmail(user.getEmail(),rawToken);
        }
    }

    @Transactional
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        List<PasswordResetToken> tokens = passwordResetTokenRepository.findByUsedFalseAndExpiryDateAfter(LocalDateTime.now());
        PasswordResetToken validToken = tokens.stream()
                .filter(t ->   passwordEncoder.matches(request.getToken(), t.getTokenHash()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        validatePassword(request.getNewPassword());

        User user = validToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        validToken.setUsed(true);
    }

    private void validatePassword(String password) {

        if (password.length() < 6 ||
                !password.matches(".*[A-Z].*") ||
                !password.matches(".*[a-z].*") ||
                !password.matches(".*\\d.*") ||
                !password.matches(".*[@#$%^&+=].*")) {

            throw new BadRequestException("PPassword must be at least 6 characters and include uppercase, lowercase, number and special character");
        }
    }
}
