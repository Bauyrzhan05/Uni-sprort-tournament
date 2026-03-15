package org.example.unisporthubbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.AuthResponse;
import org.example.unisporthubbackend.dto.LoginRequest;
import org.example.unisporthubbackend.dto.RegisterRequest;
import org.example.unisporthubbackend.entity.Role;
import org.example.unisporthubbackend.entity.User;
import org.example.unisporthubbackend.repository.UserRepository;
import org.example.unisporthubbackend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;


    public AuthResponse register(RegisterRequest request){

        User user = new User();

        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));
        user.setRole(Role.ROLE_USER);

        repo.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request){

        User user = repo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!encoder.matches(request.password(), user.getPassword())){
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }
}
