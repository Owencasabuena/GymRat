package com.gymrat.domain.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "routines")
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @OneToMany(
            mappedBy = "routine",
            cascade = {CascadeType.REMOVE, CascadeType.PERSIST},
            fetch = FetchType.LAZY
    )
    private List<Exercise> exercises = new ArrayList<>();

    public Routine() {
    }

    // Constructor without userId (for backward compatibility)
    public Routine(UUID id, String name, String description, List<Exercise> exercises) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.exercises = exercises != null ? exercises : new ArrayList<>();
    }

    // Constructor with userId
    public Routine(UUID id, String name, String description, Long userId, List<Exercise> exercises) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.userId = userId;
        this.exercises = exercises != null ? exercises : new ArrayList<>();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<Exercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Routine routine = (Routine) o;
        return Objects.equals(id, routine.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Routine{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", userId=" + userId +
                '}';
    }
}