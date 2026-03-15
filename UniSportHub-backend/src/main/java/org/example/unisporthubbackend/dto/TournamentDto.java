package org.example.unisporthubbackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TournamentDto(
        Long id,
        String name,
        String sport,
        String imageUrl,
        int maxTeams,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate startDate,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate endDate,
        String location,
        String description,
        double prize,
        LocalDateTime createAt
) { }
