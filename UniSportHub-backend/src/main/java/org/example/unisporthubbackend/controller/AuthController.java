package org.example.unisporthubbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.LoginRequest;
import org.example.unisporthubbackend.dto.RegisterRequest;
import org.example.unisporthubbackend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req){
        return new ResponseEntity<>(service.register(req), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req){
        return new ResponseEntity<>(service.login(req), HttpStatus.OK);
    }
}
