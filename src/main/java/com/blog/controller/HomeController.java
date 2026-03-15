package com.blog.controller;

import com.blog.model.Blog;
import com.blog.model.Genre;
import com.blog.service.BlogService;
import com.blog.service.GenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;

@Controller
public class HomeController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private GenreService genreService;

    @GetMapping("/explore/data")
    public ResponseEntity<?> exploreData() {
        List<Genre> genres = genreService.findAllGenres();
        List<Blog> allBlogs = blogService.findAllBlogs();

        if (genres == null) genres = new ArrayList<>();
        if (allBlogs == null) allBlogs = new ArrayList<>();

        return ResponseEntity.ok(new ExploreResponse(genres, allBlogs));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        List<Blog> popularBlogs = blogService.findPopularBlogs();
        List<Genre> genres = genreService.findAllGenres();

        // Ensure we never return null lists
        if (popularBlogs == null) {
            popularBlogs = new ArrayList<>();
        }

        if (genres == null) {
            genres = new ArrayList<>();
        }

        return ResponseEntity.ok(
                new DashboardResponse(
                        popularBlogs,
                        genres
                )
        );
    }

    // DTO Classes to Structure JSON Response
    static class DashboardResponse {
        public List<?> popularBlogs;
        public List<?> genres;

        public DashboardResponse(List<?> popularBlogs, List<?> genres) {
            this.popularBlogs = popularBlogs;
            this.genres = genres;
        }
    }

    static class ExploreResponse {
        public List<?> genres;
        public List<?> allBlogs;

        public ExploreResponse(List<?> genres, List<?> allBlogs) {
            this.genres = genres;
            this.allBlogs = allBlogs;
        }
    }

}

