package com.blog.controller;

import com.blog.model.Blog;
import com.blog.model.Genre;
import com.blog.model.User;
import com.blog.service.BlogService;
import com.blog.service.GenreService;
import com.blog.service.UserService;
import com.blog.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Controller
@RequestMapping("/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private UserService userService;

    @Autowired
    private VoteService voteService;

    @Autowired
    private GenreService genreService;

    @GetMapping("/create")
    public String showCreateForm(Model model) {
        model.addAttribute("blog", new Blog());
        model.addAttribute("genres", genreService.findAllGenres());
        return "create-blog";
    }

    @PostMapping("/create")
    public String createBlog(@ModelAttribute Blog blog, @RequestParam("genreIds") Long[] genreIds, Authentication authentication) {
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        if (user.isPresent()) {
            Set<Genre> genres = new HashSet<>();
            for (Long genreId : genreIds) {
                genreService.findById(genreId).ifPresent(genres::add);
            }

            blogService.createBlog(blog, user.get(), genres);
            return "redirect:/dashboard";
        } else {
            return "redirect:/login";
        }
    }

    @GetMapping("/{id}")
    public String viewBlog(@PathVariable Long id, Model model) {
        Optional<Blog> blog = blogService.findById(id);

        if (blog.isPresent()) {
            model.addAttribute("blog", blog.get());
            return "view-blog";
        } else {
            return "redirect:/dashboard";
        }
    }

    @GetMapping("/{id}/edit")
    public String showEditForm(@PathVariable Long id, Model model, Authentication authentication) {
        Optional<Blog> blog = blogService.findById(id);
        String username = authentication.getName();

        if (blog.isPresent() && blog.get().getAuthor().getUsername().equals(username)) {
            model.addAttribute("blog", blog.get());
            model.addAttribute("genres", genreService.findAllGenres());
            return "edit-blog";
        } else {
            return "redirect:/dashboard";
        }
    }

    @PostMapping("/{id}/edit")
    public String updateBlog(@PathVariable Long id, @ModelAttribute Blog blog,
                             @RequestParam("genreIds") Long[] genreIds, Authentication authentication) {
        Optional<Blog> existingBlog = blogService.findById(id);
        String username = authentication.getName();

        if (existingBlog.isPresent() && existingBlog.get().getAuthor().getUsername().equals(username)) {
            Blog blogToUpdate = existingBlog.get();
            blogToUpdate.setTitle(blog.getTitle());
            blogToUpdate.setContent(blog.getContent());

            Set<Genre> genres = new HashSet<>();
            for (Long genreId : genreIds) {
                genreService.findById(genreId).ifPresent(genres::add);
            }

            blogService.updateBlog(blogToUpdate, genres);
            return "redirect:/blogs/" + id;
        } else {
            return "redirect:/dashboard";
        }
    }

    @PostMapping("/{id}/vote")
    public String vote(@PathVariable Long id, @RequestParam boolean upvote, Authentication authentication) {
        Optional<Blog> blog = blogService.findById(id);
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);

        if (blog.isPresent() && user.isPresent()) {
            voteService.vote(user.get(), blog.get(), upvote);
        }

        return "redirect:/blogs/" + id;
    }

    @GetMapping("/genre/{genreName}")
    public String getBlogsByGenre(@PathVariable String genreName, Model model) {
        model.addAttribute("blogs", blogService.findBlogsByGenreName(genreName));
        model.addAttribute("genreName", genreName);
        model.addAttribute("genres", genreService.findAllGenres());
        return "genre-blogs";
    }
}

