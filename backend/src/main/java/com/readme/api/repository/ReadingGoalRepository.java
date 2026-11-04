package com.readme.api.repository;

import com.readme.api.model.ReadingGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReadingGoalRepository extends JpaRepository<ReadingGoal, Long> {

    Optional<ReadingGoal> findByYear(Integer year);
}