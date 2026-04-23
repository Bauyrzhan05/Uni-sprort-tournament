package org.example.unisporthubbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.unisporthubbackend.dto.ChooseShiftRequest;
import org.example.unisporthubbackend.service.VolunteerShiftService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteer-shifts")
@RequiredArgsConstructor
public class VolunteerShiftController {

    private final VolunteerShiftService volunteerShiftService;

    /**
     * User selects or updates their own shift
     * POST /api/volunteer-shifts
     */
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<?> chooseShift(
            @RequestBody ChooseShiftRequest request,
            Authentication authentication
    ) {
        return new ResponseEntity<>(
                volunteerShiftService.chooseShift(authentication.getName(), request),
                HttpStatus.CREATED
        );
    }

    /**
     * User views their own shift
     * GET /api/volunteer-shifts/me
     */
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<?> getMyShift(Authentication authentication) {
        return new ResponseEntity<>(
                volunteerShiftService.getMyShift(authentication.getName()),
                HttpStatus.OK
        );
    }

    /**
     * Admin views all selected shifts
     * GET /api/volunteer-shifts
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllShifts() {
        return new ResponseEntity<>(
                volunteerShiftService.getAllShifts(),
                HttpStatus.OK
        );
    }

    /**
     * Admin clears another user's shift
     * DELETE /api/volunteer-shifts/{userId}
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> clearUserShift(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        return new ResponseEntity<>(
                volunteerShiftService.clearUserShift(userId, authentication.getName()),
                HttpStatus.OK
        );
    }
}
