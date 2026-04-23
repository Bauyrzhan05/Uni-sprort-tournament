package org.example.unisporthubbackend.dto;

public record ShiftResponseDto(
        Long userId,
        String username,
        String shift
) {
}
