package org.example.unisporthubbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.TournamentDto;
import org.example.unisporthubbackend.entity.Tournament;
import org.example.unisporthubbackend.mapper.TournamentMapper;
import org.example.unisporthubbackend.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentMapper tournamentMapper;
    private final ImageService imageService;

    public List<TournamentDto> getAll() {
        return tournamentMapper.toDtoList(tournamentRepository.findAll());
    }

    public TournamentDto getOne(Long id) {
        return tournamentMapper.toDto(tournamentRepository.findById(id).orElseThrow());
    }

    public TournamentDto create(TournamentDto tournamentDto, MultipartFile image) throws IOException {

        Tournament tournament = tournamentMapper.toEntity(tournamentDto);

        String imageUrl = imageService.saveImage(image);
        tournament.setImageUrl(imageUrl);

        Tournament saved = tournamentRepository.save(tournament);

        return tournamentMapper.toDto(saved);
    }

    public TournamentDto update(Long id, TournamentDto tournamentDto) {

        Tournament update = tournamentRepository.findById(id).orElseThrow();

        update.setName(tournamentDto.name());
        update.setSport(tournamentDto.sport());
        update.setDescription(tournamentDto.description());
        update.setMaxTeams(tournamentDto.maxTeams());
//        update.setImageUrl(tournamentDto.imageUrl());
        update.setPrize(tournamentDto.prize());
        update.setLocation(tournamentDto.location());
        update.setStartDate(tournamentDto.startDate());
        update.setEndDate(tournamentDto.endDate());

        return tournamentMapper.toDto(tournamentRepository.save(update));
    }

    public boolean delete(long id) {
        tournamentRepository.deleteById(id);
        return true;
    }

}
