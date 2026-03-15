package org.example.unisporthubbackend.service;


import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.TeamDto;
import org.example.unisporthubbackend.entity.Team;
import org.example.unisporthubbackend.mapper.TeamMapper;
import org.example.unisporthubbackend.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;

    public List<TeamDto> getAll(){
        return teamMapper.toDtoList(teamRepository.findAll());
    }

    public TeamDto getOne(Long id){
        return teamMapper.toDto(teamRepository.findById(id).orElseThrow());
    }

    public TeamDto create(TeamDto teamDto){
        return teamMapper.toDto(teamRepository.save(teamMapper.toEntity(teamDto)));
    }

    public TeamDto update(Long id, TeamDto teamDto) {
        Team team = teamRepository.findById(id).orElseThrow();

        team.setTeamName(teamDto.teamName());

        return teamMapper.toDto(teamRepository.save(team));
    }

    public boolean delete(Long id){
        teamRepository.deleteById(id);
        return true;
    }
}
