package com.JustEat.service.Impl;

import com.JustEat.dto.request.ForgotPasswordRequest;
import com.JustEat.dto.request.LoginRequest;
import com.JustEat.dto.request.RegisterRequest;
import com.JustEat.dto.request.ResetPasswordRequest;
import com.JustEat.dto.response.AuthResponse;
import com.JustEat.entity.PasswordResetToken;
import com.JustEat.entity.User;
import com.JustEat.enums.Gender;
import com.JustEat.enums.Location;
import com.JustEat.enums.Role;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.PasswordResetTokenRepository;
import com.JustEat.repository.UserRepository;
import com.JustEat.security.JwtUtil;
import com.JustEat.service.helper.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerThrowsWhenEmailAlreadyExists() {
        RegisterRequest request = buildRegisterRequest();
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerSavesUserWhenRequestIsValid() {
        RegisterRequest request = buildRegisterRequest();
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed-pass");

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();
        assertEquals("john@example.com", saved.getEmail());
        assertEquals("hashed-pass", saved.getPasswordHash());
        assertEquals(Role.CUSTOMER, saved.getRole());
        assertEquals(Location.NOIDA, saved.getLocation());
    }

    @Test
    void loginThrowsWhenPasswordDoesNotMatch() {
        User user = new User();
        user.setEmail("john@example.com");
        user.setPasswordHash("stored-hash");

        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrong");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "stored-hash")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.login(request));
        verify(jwtUtil, never()).generateToken(any(), anyString());
    }

    @Test
    void loginReturnsTokenWhenCredentialsAreValid() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setPublicId(userId);
        user.setEmail("john@example.com");
        user.setPasswordHash("stored-hash");
        user.setRole(Role.OWNER);
        user.setLocation(Location.DELHI);

        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("Strong@1");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Strong@1", "stored-hash")).thenReturn(true);
        when(jwtUtil.generateToken(userId, "OWNER")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-token", response.getToken());
        assertEquals("OWNER", response.getRole());
        assertEquals(userId, response.getUserId());
        assertEquals("DELHI", response.getLocation());
    }

    @Test
    void forgotPasswordCreatesTokenAndSendsEmailWhenUserExists() {
        User user = new User();
        user.setEmail("john@example.com");

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("john@example.com");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-token");

        authService.forgotPassword(request);

        verify(passwordResetTokenRepository).deleteAllByUser(user);
        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq("john@example.com"), anyString());
    }

    @Test
    void resetPasswordMarksTokenUsedAndUpdatesPasswordWhenTokenMatches() {
        User user = new User();
        user.setPasswordHash("old");

        PasswordResetToken token = new PasswordResetToken();
        token.setTokenHash("encoded-token");
        token.setUser(user);
        token.setUsed(false);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(5));

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("raw-token");
        request.setNewPassword("Strong@1");

        when(passwordResetTokenRepository.findByUsedFalseAndExpiryDateAfter(any(LocalDateTime.class)))
                .thenReturn(List.of(token));
        when(passwordEncoder.matches("raw-token", "encoded-token")).thenReturn(true);
        when(passwordEncoder.encode("Strong@1")).thenReturn("new-hash");

        authService.resetPassword(request);

        assertEquals("new-hash", user.getPasswordHash());
        assertTrue(token.isUsed());
    }

    private RegisterRequest buildRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@example.com");
        request.setPassword("Strong@1");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setGender(Gender.MALE);
        request.setPhoneNumber("9876543210");
        request.setLocation(Location.NOIDA);
        request.setRole(Role.CUSTOMER);
        return request;
    }
}

