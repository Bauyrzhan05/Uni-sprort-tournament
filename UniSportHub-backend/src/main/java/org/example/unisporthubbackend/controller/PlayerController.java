package org.example.unisporthubbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.PlayerDto;
import org.example.unisporthubbackend.service.PlayerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAll() {
        return new ResponseEntity<>(playerService.getAll(), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/{teamId}")
    public ResponseEntity<?> getPlayersByTeam(@PathVariable Long teamId) {
        return new ResponseEntity<>(playerService.getPlayersByTeam(teamId), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PlayerDto playerDto) {
        return new ResponseEntity<>(playerService.createPlayer(playerDto), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return new ResponseEntity<>(playerService.delete(id), HttpStatus.OK);
    }
}
