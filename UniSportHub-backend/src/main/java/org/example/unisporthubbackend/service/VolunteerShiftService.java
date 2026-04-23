package org.example.unisporthubbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.ChooseShiftRequest;
import org.example.unisporthubbackend.dto.ShiftResponseDto;
import org.example.unisporthubbackend.entity.Role;
import org.example.unisporthubbackend.entity.ShiftType;
import org.example.unisporthubbackend.entity.User;
import org.example.unisporthubbackend.exception.BadRequestException;
import org.example.unisporthubbackend.exception.ForbiddenActionException;
import org.example.unisporthubbackend.exception.ResourceNotFoundException;
import org.example.unisporthubbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VolunteerShiftService {

    private final UserRepository userRepository;

    /**
     * User chooses or updates their own shift
     */
    public ShiftResponseDto chooseShift(String email, ChooseShiftRequest request) {
        // Validate shift value
        ShiftType shiftType = validateAndParseShift(String.valueOf(request.shift()));

        // Get current user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update shift
        user.setVolunteerShift(shiftType);
        userRepository.save(user);

        return new ShiftResponseDto(
                user.getId(),
                user.getUsername(),
                shiftType.name()
        );
    }

    /**
     * User views their own shift
     */
    public Map<String, Object> getMyShift(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getVolunteerShift() == null) {
            return Map.of(
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "shift", null,
                    "message", "No shift selected yet"
            );
        }

        return Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "shift", user.getVolunteerShift().name()
        );
    }

    /**
     * Admin views all users who selected shifts
     */
    public List<ShiftResponseDto> getAllShifts() {
        return userRepository.findByVolunteerShiftIsNotNull()
                .stream()
                .map(user -> new ShiftResponseDto(
                        user.getId(),
                        user.getUsername(),
                        user.getVolunteerShift().name()
                ))
                .toList();
    }

    /**
     * Admin clears another user's shift
     */
    public Map<String, Object> clearUserShift(Long userId, String adminEmail) {
        // Verify admin exists
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new ForbiddenActionException("Only admins can clear shifts");
        }

        // Find target user
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Clear shift
        targetUser.setVolunteerShift(null);
        userRepository.save(targetUser);

        return Map.of(
                "message", "Shift cleared successfully",
                "userId", targetUser.getId(),
                "username", targetUser.getUsername()
        );
    }

    /**
     * Validate shift value
     */
    private ShiftType validateAndParseShift(String shift) {
        if (shift == null || shift.isBlank()) {
            throw new BadRequestException("Shift value cannot be empty");
        }

        try {
            return ShiftType.valueOf(shift.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid shift value. Allowed values are: MORNING, EVENING"
            );
        }
    }
}
