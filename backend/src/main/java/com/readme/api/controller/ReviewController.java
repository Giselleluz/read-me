
package com.readme.api.controller;

import com.readme.api.model.Review;
import com.readme.api.repository.BookRepository;
import com.readme.api.service.ReviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final BookRepository bookRepository;

    public ReviewController(
            ReviewService reviewService,
            BookRepository bookRepository) {
        this.reviewService = reviewService;
        this.bookRepository = bookRepository;
    }

    // Lista todas as avaliações
    @GetMapping
    public List<Review> findAll() {
        return reviewService.findAll();
    }

    // Busca uma avaliação pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Review> findById(@PathVariable Long id) {
        Optional<Review> review = reviewService.findById(id);

        return review.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Busca a avaliação de um livro
    @GetMapping("/book/{bookId}")
    public ResponseEntity<Review> findByBookId(
            @PathVariable Long bookId) {

        Optional<Review> review = reviewService.findByBookId(bookId);

        return review.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cria uma avaliação
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Review review) {

        if (review.getRating() == null ||
                review.getRating() < 1 ||
                review.getRating() > 5) {
            return ResponseEntity.badRequest()
                    .body("A avaliação deve ser entre 1 e 5.");
        }

        if (review.getBookId() == null ||
                !bookRepository.existsById(review.getBookId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Livro não encontrado.");
        }

        if (reviewService.findByBookId(review.getBookId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este livro já possui uma avaliação.");
        }

        Review savedReview = reviewService.save(review);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    // Atualiza uma avaliação
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Review review) {

        Optional<Review> existingReview = reviewService.findById(id);

        if (existingReview.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (review.getRating() == null ||
                review.getRating() < 1 ||
                review.getRating() > 5) {
            return ResponseEntity.badRequest()
                    .body("A avaliação deve ser entre 1 e 5.");
        }

        if (review.getBookId() == null ||
                !bookRepository.existsById(review.getBookId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Livro não encontrado.");
        }

        Optional<Review> reviewForBook =
                reviewService.findByBookId(review.getBookId());

        if (reviewForBook.isPresent() &&
                !reviewForBook.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este livro já possui outra avaliação.");
        }

        review.setId(id);

        Review updatedReview = reviewService.save(review);

        return ResponseEntity.ok(updatedReview);
    }

    // Exclui uma avaliação
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        if (reviewService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        reviewService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
