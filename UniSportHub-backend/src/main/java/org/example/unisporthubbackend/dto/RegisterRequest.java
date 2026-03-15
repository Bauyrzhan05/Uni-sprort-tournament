package org.example.unisporthubbackend.dto;

public record RegisterRequest(
         String username,
         String email,
         String password
) {}
