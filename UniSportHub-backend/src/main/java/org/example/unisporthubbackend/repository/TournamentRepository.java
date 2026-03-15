package org.example.unisporthubbackend.repository;

import org.example.unisporthubbackend.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}
