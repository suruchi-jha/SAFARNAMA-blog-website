package com.blog.service;

import com.blog.model.Genre;
import com.blog.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class GenreService {

    @Autowired
    private GenreRepository genreRepository;

    @PostConstruct
    @Transactional
    public void initGenres() {
        try {
            // Initialize default genres if they don't exist
            List<String> defaultGenres = Arrays.asList(
                    "Travel", "Food", "Technology", "Lifestyle", "Health",
                    "Fitness", "Fashion", "Beauty", "Business", "Finance",
                    "Education", "Entertainment", "Sports", "Politics", "Science"
            );

            // Check if we have any genres at all
            long genreCount = genreRepository.count();
            System.out.println("Current genre count: " + genreCount);

            if (genreCount == 0) {
                System.out.println("No genres found. Creating default genres...");
                for (String genreName : defaultGenres) {
                    Genre genre = new Genre();
                    genre.setName(genreName);
                    genreRepository.save(genre);
                    System.out.println("Created genre: " + genreName);
                }
            }

            // Debug log
            List<Genre> allGenres = genreRepository.findAll();
            System.out.println("Total genres in database: " + allGenres.size());
            for (Genre genre : allGenres) {
                System.out.println("Genre in DB: " + genre.getId() + " - " + genre.getName());
            }
        } catch (Exception e) {
            System.err.println("Error initializing genres: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public List<Genre> findAllGenres() {
        try {
            List<Genre> genres = genreRepository.findAll();
            System.out.println("findAllGenres returning " + genres.size() + " genres");

            // If no genres exist yet, try to initialize them again
            if (genres.isEmpty()) {
                System.out.println("No genres found in findAllGenres. Creating default genres...");
                createDefaultGenres();
                genres = genreRepository.findAll();
            }

            return genres;
        } catch (Exception e) {
            System.err.println("Error in findAllGenres: " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Return empty list on error
        }
    }

    @Transactional
    public void createDefaultGenres() {
        try {
            List<String> defaultGenres = Arrays.asList(
                    "Travel", "Food", "Technology", "Lifestyle", "Health"
            );

            for (String genreName : defaultGenres) {
                if (!genreRepository.existsByName(genreName)) {
                    Genre genre = new Genre();
                    genre.setName(genreName);
                    genreRepository.save(genre);
                    System.out.println("Created missing genre: " + genreName);
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating default genres: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public Optional<Genre> findById(Long id) {
        return genreRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Genre> findByName(String name) {
        return genreRepository.findByName(name);
    }

    @Transactional
    public Genre createGenre(Genre genre) {
        return genreRepository.save(genre);
    }
}
