package org.example.unisporthubbackend.repository;

import org.example.unisporthubbackend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByOwnerId(Long ownerId);
}
