package com.gymrat.repositories;

import com.gymrat.domain.entities.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, UUID> {
    List<Routine> findByExercises_Id(UUID exerciseId);
    Optional<Routine> findByExercises_IdAndId(UUID exerciseId, UUID id);
    List<Routine> findByUserId(Long userId);
}
