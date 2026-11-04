package com.readme.api.repository;

import com.readme.api.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryRepository
        extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByBookId(Long bookId);

}