package com.readme.api.controller;

import com.readme.api.model.JournalEntry;
import com.readme.api.service.JournalEntryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal")
@CrossOrigin(origins = "*")
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    public JournalEntryController(
            JournalEntryService journalEntryService) {
        this.journalEntryService = journalEntryService;
    }

    // Buscar todas as entradas
    @GetMapping
    public List<JournalEntry> findAll() {
        return journalEntryService.findAll();
    }

    // Buscar entradas de um livro específico
    @GetMapping("/book/{bookId}")
    public List<JournalEntry> findByBookId(
            @PathVariable Long bookId) {
        return journalEntryService.findByBookId(bookId);
    }

    // Buscar uma entrada pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<JournalEntry> findById(
            @PathVariable Long id) {
        return journalEntryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cadastrar uma entrada
    @PostMapping
    public JournalEntry save(@RequestBody JournalEntry entry) {
        return journalEntryService.save(entry);
    }

    // Atualizar uma entrada
    @PutMapping("/{id}")
    public ResponseEntity<JournalEntry> update(
            @PathVariable Long id,
            @RequestBody JournalEntry entry) {

        return journalEntryService.findById(id)
                .map(existingEntry -> {
                    entry.setId(id);
                    return ResponseEntity.ok(
                            journalEntryService.save(entry)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Excluir uma entrada
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return journalEntryService.findById(id)
                .map(entry -> {
                    journalEntryService.delete(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}