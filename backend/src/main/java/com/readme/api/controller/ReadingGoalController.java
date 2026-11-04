package com.readme.api.controller;

import com.readme.api.model.ReadingGoal;
import com.readme.api.service.ReadingGoalService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class ReadingGoalController {

    private final ReadingGoalService service;

    public ReadingGoalController(ReadingGoalService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReadingGoal> findAll() {
        return service.findAll();
    }

    @GetMapping("/{year}")
    public ResponseEntity<ReadingGoal> findByYear(@PathVariable Integer year) {
        return service.findByYear(year)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReadingGoal goal) {

        if (goal.getYear() == null || goal.getTargetBooks() == null
                || goal.getYear() < 2000 || goal.getTargetBooks() <= 0) {
            return ResponseEntity.badRequest()
                    .body("Informe um ano válido e uma meta maior que zero.");
        }

        if (service.findByYear(goal.getYear()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Já existe uma meta cadastrada para esse ano.");
        }

        return ResponseEntity.ok(service.save(goal));
    }

    @PutMapping("/{year}")
    public ResponseEntity<?> update(
            @PathVariable Integer year,
            @RequestBody ReadingGoal updatedGoal) {

        if (updatedGoal.getTargetBooks() == null || updatedGoal.getTargetBooks() <= 0) {
            return ResponseEntity.badRequest()
                    .body("A meta deve ser maior que zero.");
        }

        return service.findByYear(year)
                .map(goal -> {
                    goal.setTargetBooks(updatedGoal.getTargetBooks());
                    return ResponseEntity.ok(service.save(goal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{year}")
    public ResponseEntity<Void> delete(@PathVariable Integer year) {

        return service.findByYear(year)
                .map(goal -> {
                    service.delete(goal.getId());
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}