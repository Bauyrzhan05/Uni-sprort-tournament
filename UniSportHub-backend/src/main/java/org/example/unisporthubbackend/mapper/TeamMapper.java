package org.example.unisporthubbackend.mapper;

import org.example.unisporthubbackend.dto.TeamDto;
import org.example.unisporthubbackend.entity.Team;
import org.example.unisporthubbackend.entity.Tournament;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = PlayerMapper.class)
public interface TeamMapper {

    @Mapping(source = "tournament.id", target = "tournamentId")
    TeamDto toDto(Team team);

    @Mapping(target = "tournament", expression = "java(mapTournament(teamDto.tournamentId()))")
    Team toEntity(TeamDto teamDto);

    List<TeamDto> toDtoList(List<Team> teams);

    default Tournament mapTournament(Long tournamentId) {
        if (tournamentId == null) return null;
        Tournament t = new Tournament();
        t.setId(tournamentId);
        return t;
    }
}
