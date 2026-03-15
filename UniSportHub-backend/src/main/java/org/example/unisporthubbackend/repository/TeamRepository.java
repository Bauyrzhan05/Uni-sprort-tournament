package org.example.unisporthubbackend.repository;

import org.example.unisporthubbackend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
