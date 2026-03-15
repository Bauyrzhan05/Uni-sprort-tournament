package org.example.unisporthubbackend.mapper;

import org.example.unisporthubbackend.dto.PlayerDto;
import org.example.unisporthubbackend.entity.Player;
import org.example.unisporthubbackend.entity.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlayerMapper {

    @Mapping(source = "team.id", target = "teamId")
    PlayerDto toDto(Player player);

    @Mapping(target = "team", expression = "java(mapTeam(playerDto.teamId()))")
    Player toEntity(PlayerDto playerDto);

    List<PlayerDto> toDtoList(List<Player> players);

    default Team mapTeam(Long teamId) {
        if (teamId == null) return null;
        Team team = new Team();
        team.setId(teamId);
        return team;
    }
}
