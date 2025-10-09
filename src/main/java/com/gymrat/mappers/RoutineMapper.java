package com.gymrat.mappers;

import com.gymrat.domain.dto.RoutineDto;
import com.gymrat.domain.entities.Routine;

public interface RoutineMapper {

    Routine fromDTO(RoutineDto routineDto);
    RoutineDto toDTO(Routine routine);
}
