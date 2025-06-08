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

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("genres", genreService.findAllGenres());
        return "home";
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

    @GetMapping("/explore")
    public String explore(Model model) {
        model.addAttribute("genres", genreService.findAllGenres());
        model.addAttribute("allBlogs", blogService.findAllBlogs());
        return "explore";
    }
}

