package org.example.unisporthubbackend.mapper;

import org.example.unisporthubbackend.dto.TeamDto;
import org.example.unisporthubbackend.entity.Team;
import org.example.unisporthubbackend.entity.Tournament;
import org.example.unisporthubbackend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring", uses = PlayerMapper.class)
public interface TeamMapper {

    @Mapping(source = "tournament.id", target = "tournamentId")
    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.displayName", target = "ownerName")
    @Mapping(target = "memberIds", expression = "java(mapMemberIds(team.getMembers()))")
    @Mapping(target = "memberCount", expression = "java(team.getMembers() != null ? team.getMembers().size() : 0)")
    @Mapping(target = "canManage", ignore = true)
    @Mapping(target = "isMember", ignore = true)
    TeamDto toDto(Team team);

    @Mapping(target = "tournament", expression = "java(mapTournament(teamDto.tournamentId()))")
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "members", ignore = true)
    Team toEntity(TeamDto teamDto);

    List<TeamDto> toDtoList(List<Team> teams);

    default Tournament mapTournament(Long tournamentId) {
        if (tournamentId == null) return null;
        Tournament t = new Tournament();
        t.setId(tournamentId);
        return t;
    }

    default List<Long> mapMemberIds(List<User> members) {
        if (members == null || members.isEmpty()) {
            return Collections.emptyList();
        }
        return members.stream().map(User::getId).toList();
    }
}
