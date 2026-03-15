package org.example.unisporthubbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.TournamentDto;
import org.example.unisporthubbackend.service.TournamentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return new ResponseEntity<>(tournamentService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return new ResponseEntity<>(tournamentService.getOne(id), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> create(
            @RequestPart("tournament") TournamentDto tournamentDto,
            @RequestPart("image") MultipartFile image) throws java.io.IOException {
        return new ResponseEntity<>(tournamentService.create(tournamentDto, image), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody TournamentDto tournamentDto) {
        return new ResponseEntity<>(tournamentService.update(id, tournamentDto), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return new ResponseEntity<>(tournamentService.delete(id), HttpStatus.OK);
    }
}
