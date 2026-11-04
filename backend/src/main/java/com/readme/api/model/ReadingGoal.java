package com.readme.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reading_goals")
public class ReadingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer year;

    @Column(name = "target_books", nullable = false)
    private Integer targetBooks;

    public ReadingGoal() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getTargetBooks() {
        return targetBooks;
    }

    public void setTargetBooks(Integer targetBooks) {
        this.targetBooks = targetBooks;
    }
}