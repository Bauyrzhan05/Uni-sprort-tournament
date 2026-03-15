package org.example.unisporthubbackend.dto;


import java.util.List;

public record TeamDto(
        Long id,
        String teamName,
        List<PlayerDto> players,
        Long tournamentId
) {}
