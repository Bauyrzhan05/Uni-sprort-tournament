package org.example.unisporthubbackend.dto;

public record LoginRequest(
        String email,
        String password
) {}
