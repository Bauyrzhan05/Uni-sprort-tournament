package org.example.unisporthubbackend.mapper;

import org.example.unisporthubbackend.dto.TournamentDto;
import org.example.unisporthubbackend.entity.Tournament;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TournamentMapper {

    TournamentDto toDto(Tournament tournament);
    Tournament toEntity(TournamentDto tournamentDto);

    List<TournamentDto> toDtoList(List<Tournament> tournaments);
}
