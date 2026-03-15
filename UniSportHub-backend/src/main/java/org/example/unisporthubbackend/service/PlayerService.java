package org.example.unisporthubbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.PlayerDto;
import org.example.unisporthubbackend.entity.Player;
import org.example.unisporthubbackend.mapper.PlayerMapper;
import org.example.unisporthubbackend.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerMapper playerMapper;

    public PlayerDto createPlayer(PlayerDto playerDto){
        return playerMapper.toDto(playerRepository.save(playerMapper.toEntity(playerDto)));
    }

    public List<PlayerDto> getPlayersByTeam(Long teamId){
        List<Player> players = playerRepository.findByTeamId(teamId);

        return playerMapper.toDtoList(players);
    }

    public List<PlayerDto> getAll(){
        return playerMapper.toDtoList(playerRepository.findAll());
    }

    public boolean delete(Long id) {
        playerRepository.deleteById(id);
        return true;
    }
}
