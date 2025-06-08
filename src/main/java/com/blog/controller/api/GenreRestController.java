package com.blog.controller.api;

import com.blog.model.Genre;
import com.blog.service.GenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/genres")
public class GenreRestController {

    @Autowired
    private GenreService genreService;

    @GetMapping
    public ResponseEntity<List<Genre>> getAllGenres() {
        try {
            List<Genre> genres = genreService.findAllGenres();
            // Ensure we never return null
            if (genres == null) {
                genres = new ArrayList<>();
            }

            // Debug log
            System.out.println("Returning " + genres.size() + " genres");
            for (Genre genre : genres) {
                System.out.println("Genre: " + genre.getId() + " - " + genre.getName());
            }

            return ResponseEntity.ok(genres);
        } catch (Exception e) {
            System.err.println("Error in getAllGenres: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>()); // Return empty list on error
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGenreById(@PathVariable Long id) {
        return genreService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<?> getGenreByName(@PathVariable String name) {
        return genreService.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
