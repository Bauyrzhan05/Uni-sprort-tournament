package org.example.unisporthubbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.TeamDto;
import org.example.unisporthubbackend.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAll(Authentication authentication) {
        return new ResponseEntity<>(teamService.getAll(authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id, Authentication authentication) {
        return new ResponseEntity<>(teamService.getOne(id, authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TeamDto teamDto, Authentication authentication) {
        return new ResponseEntity<>(teamService.create(teamDto, authentication.getName()), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TeamDto teamDto, Authentication authentication) {
        return new ResponseEntity<>(teamService.update(id, teamDto, authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable long id, Authentication authentication) {
        return new ResponseEntity<>(teamService.delete(id, authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinTeam(@PathVariable Long id, Authentication authentication) {
        return new ResponseEntity<>(teamService.joinTeam(id, authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveTeam(@PathVariable Long id, Authentication authentication) {
        return new ResponseEntity<>(teamService.leaveTeam(id, authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<?> addMemberByAdmin(@PathVariable Long id, @PathVariable Long userId, Authentication authentication) {
        return new ResponseEntity<>(teamService.addMemberByAdmin(id, userId, authentication.getName()), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMemberByAdmin(@PathVariable Long id, @PathVariable Long userId, Authentication authentication) {
        return new ResponseEntity<>(teamService.removeMemberByAdmin(id, userId, authentication.getName()), HttpStatus.OK);
    }
}
