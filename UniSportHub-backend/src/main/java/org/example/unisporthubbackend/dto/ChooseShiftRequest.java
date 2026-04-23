package org.example.unisporthubbackend.dto;

import org.example.unisporthubbackend.entity.ShiftType;

public record ChooseShiftRequest(
        ShiftType shift
) {
}
