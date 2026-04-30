package com.JustEat.service.Impl;


import com.JustEat.dto.response.AuthResponse;
import com.JustEat.dto.request.LoginRequest;
import com.JustEat.dto.request.RegisterRequest;
import com.JustEat.entity.User;
import com.JustEat.enums.Role;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.UserRepository;
import com.JustEat.security.JwtUtil;
import com.JustEat.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private  final JwtUtil jwtUtil;

    public void register(RegisterRequest req){
        if(userRepository.existsByEmail(req.getEmail())){
            throw new BadRequestException("Email already exists");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        if (req.getRole() != Role.CUSTOMER && req.getRole() != Role.OWNER) {
            throw new BadRequestException("Invalid role selection");
        }
        user.setRole(req.getRole());
        user.setLocation(req.getLocation());
        user.setGender(req.getGender());
        user.setPhoneNumber(req.getPhoneNumber());
        if(req.getProfileImageUrl()!=null){
            user.setProfileImageUrl(req.getProfileImageUrl());
        }
        userRepository.save(user);
    }
    public AuthResponse login(LoginRequest req){
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(()-> new BadRequestException("Wrong email or password"));

        if(!passwordEncoder.matches(req.getPassword(),user.getPasswordHash())){
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

}
