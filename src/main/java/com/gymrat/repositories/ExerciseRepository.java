package com.gymrat.repositories;

import com.gymrat.domain.entities.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findByRoutineId(UUID routineId);
    Optional<Exercise> findByRoutineIdAndId(UUID routineId, UUID id);
    void deleteByRoutineIdAndId(UUID routineId, UUID id);
}
