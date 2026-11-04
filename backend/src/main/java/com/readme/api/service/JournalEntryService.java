package com.readme.api.service;

import com.readme.api.model.JournalEntry;
import com.readme.api.repository.JournalEntryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;

    public JournalEntryService(
            JournalEntryRepository journalEntryRepository) {
        this.journalEntryRepository = journalEntryRepository;
    }

    public JournalEntry save(JournalEntry entry) {
        return journalEntryRepository.save(entry);
    }

    public List<JournalEntry> findAll() {
        return journalEntryRepository.findAll();
    }

    public List<JournalEntry> findByBookId(Long bookId) {
        return journalEntryRepository.findByBookId(bookId);
    }

    public Optional<JournalEntry> findById(Long id) {
        return journalEntryRepository.findById(id);
    }

    public void delete(Long id) {
        journalEntryRepository.deleteById(id);
    }
}