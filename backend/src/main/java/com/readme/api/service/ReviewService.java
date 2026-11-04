
package com.readme.api.service;

import com.readme.api.model.Review;
import com.readme.api.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // Salva ou atualiza uma avaliação
    public Review save(Review review) {
        return reviewRepository.save(review);
    }

    // Busca todas as avaliações
    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    // Busca uma avaliação pelo ID
    public Optional<Review> findById(Long id) {
        return reviewRepository.findById(id);
    }

    // Busca a avaliação de um livro específico
    public Optional<Review> findByBookId(Long bookId) {
        return reviewRepository.findByBookId(bookId);
    }

    // Exclui uma avaliação
    public void delete(Long id) {
        reviewRepository.deleteById(id);
    }
}
