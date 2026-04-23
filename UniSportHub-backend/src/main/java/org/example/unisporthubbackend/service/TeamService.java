package org.example.unisporthubbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.TeamDto;
import org.example.unisporthubbackend.entity.Role;
import org.example.unisporthubbackend.entity.Team;
import org.example.unisporthubbackend.entity.User;
import org.example.unisporthubbackend.exception.BadRequestException;
import org.example.unisporthubbackend.exception.ForbiddenActionException;
import org.example.unisporthubbackend.exception.ResourceNotFoundException;
import org.example.unisporthubbackend.mapper.TeamMapper;
import org.example.unisporthubbackend.repository.TeamRepository;
import org.example.unisporthubbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;

    @Transactional(readOnly = true)
    public List<TeamDto> getAll(String email){
        User currentUser = getCurrentUser(email);
        return teamRepository.findAll().stream()
                .map(team -> enrichDto(team, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamDto getOne(Long id, String email){
        User currentUser = getCurrentUser(email);
        Team team = getTeamById(id);
        return enrichDto(team, currentUser);
    }

    public TeamDto create(TeamDto teamDto, String email){
        User currentUser = getCurrentUser(email);

        Team team = teamMapper.toEntity(teamDto);
        team.setId(null);
        team.setOwner(currentUser);
        if (team.getMembers() == null) {
            team.setMembers(new java.util.ArrayList<>());
        }
        if (!containsUser(team.getMembers(), currentUser.getId())) {
            team.getMembers().add(currentUser);
        }

        return enrichDto(teamRepository.save(team), currentUser);
    }

    public TeamDto update(Long id, TeamDto teamDto, String email) {
        User currentUser = getCurrentUser(email);
        Team team = getTeamById(id);
        validateOwnerOrAdmin(team, currentUser);

        team.setTeamName(teamDto.teamName());
        if (teamDto.tournamentId() != null) {
            team.setTournament(teamMapper.mapTournament(teamDto.tournamentId()));
        }

        return enrichDto(teamRepository.save(team), currentUser);
    }

    public boolean delete(Long id, String email){
        User currentUser = getCurrentUser(email);
        Team team = getTeamById(id);
        validateOwnerOrAdmin(team, currentUser);
        teamRepository.delete(team);
        return true;
    }

    public TeamDto joinTeam(Long teamId, String email) {
        User currentUser = getCurrentUser(email);
        Team team = getTeamById(teamId);

        if (containsUser(team.getMembers(), currentUser.getId())) {
            throw new BadRequestException("You are already a member of this team");
        }

        team.getMembers().add(currentUser);
        return enrichDto(teamRepository.save(team), currentUser);
    }

    public TeamDto leaveTeam(Long teamId, String email) {
        User currentUser = getCurrentUser(email);
        Team team = getTeamById(teamId);

        if (!containsUser(team.getMembers(), currentUser.getId())) {
            throw new BadRequestException("You are not a member of this team");
        }

        if (team.getOwner() != null && team.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Team owner cannot leave their own team. Transfer ownership or delete the team instead");
        }

        team.getMembers().removeIf(member -> member.getId().equals(currentUser.getId()));
        return enrichDto(teamRepository.save(team), currentUser);
    }

    public TeamDto addMemberByAdmin(Long teamId, Long userId, String email) {
        User currentUser = getCurrentUser(email);
        validateAdmin(currentUser);

        Team team = getTeamById(teamId);
        User userToAdd = getUserById(userId);

        if (containsUser(team.getMembers(), userToAdd.getId())) {
            throw new BadRequestException("User is already a member of this team");
        }

        team.getMembers().add(userToAdd);
        return enrichDto(teamRepository.save(team), currentUser);
    }

    public TeamDto removeMemberByAdmin(Long teamId, Long userId, String email) {
        User currentUser = getCurrentUser(email);
        validateAdmin(currentUser);

        Team team = getTeamById(teamId);
        User userToRemove = getUserById(userId);

        if (team.getOwner() != null && team.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Admin cannot remove the team owner from members list");
        }

        if (!containsUser(team.getMembers(), userToRemove.getId())) {
            throw new BadRequestException("User is not a member of this team");
        }

        team.getMembers().removeIf(member -> member.getId().equals(userId));
        return enrichDto(teamRepository.save(team), currentUser);
    }

    private TeamDto enrichDto(Team team, User currentUser) {
        TeamDto dto = teamMapper.toDto(team);
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = team.getOwner() != null && team.getOwner().getId().equals(currentUser.getId());
        boolean isMember = containsUser(team.getMembers(), currentUser.getId());

        return new TeamDto(
                dto.id(),
                dto.teamName(),
                dto.players(),
                dto.tournamentId(),
                dto.ownerId(),
                dto.ownerName(),
                dto.memberIds(),
                dto.memberCount(),
                isAdmin || isOwner,
                isMember
        );
    }

    private void validateOwnerOrAdmin(Team team, User currentUser) {
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = team.getOwner() != null && team.getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new ForbiddenActionException("You can manage only the teams created by you");
        }
    }

    private void validateAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenActionException("Only admin can add or remove other users in a team");
        }
    }

    private Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private boolean containsUser(List<User> users, Long userId) {
        return users != null && users.stream().anyMatch(user -> user.getId().equals(userId));
    }
}
