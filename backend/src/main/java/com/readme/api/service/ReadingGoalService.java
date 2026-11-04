package com.readme.api.service;

import com.readme.api.model.ReadingGoal;
import com.readme.api.repository.ReadingGoalRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReadingGoalService {

    private final ReadingGoalRepository repository;

    public ReadingGoalService(ReadingGoalRepository repository) {
        this.repository = repository;
    }

    public List<ReadingGoal> findAll() {
        return repository.findAll();
    }

    public Optional<ReadingGoal> findByYear(Integer year) {
        return repository.findByYear(year);
    }

    public ReadingGoal save(ReadingGoal goal) {
        return repository.save(goal);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}