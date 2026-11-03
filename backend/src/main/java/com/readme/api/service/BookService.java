
package com.readme.api.service;

import com.readme.api.model.Book;
import com.readme.api.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // Cadastrar ou atualizar um livro
    public Book save(Book book) {
        return bookRepository.save(book);
    }

    // Listar todos os livros
    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    // Buscar livro pelo ID
    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    // Excluir livro pelo ID
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }
}
