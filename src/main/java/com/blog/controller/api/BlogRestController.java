package com.blog.controller.api;

import com.blog.model.Blog;
import com.blog.model.Genre;
import com.blog.model.User;
import com.blog.service.BlogService;
import com.blog.service.GenreService;
import com.blog.service.UserService;
import com.blog.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/blogs")
public class BlogRestController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private UserService userService;

    @Autowired
    private GenreService genreService;

    @Autowired
    private VoteService voteService;

    @GetMapping
    public ResponseEntity<List<Blog>> getAllBlogs() {
        return ResponseEntity.ok(blogService.findAllBlogs());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Blog>> getPopularBlogs() {
        return ResponseEntity.ok(blogService.findPopularBlogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBlogById(@PathVariable Long id) {
        Optional<Blog> blog = blogService.findById(id);
        if (blog.isPresent()) {
            return ResponseEntity.ok(blog.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Blog not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/author/{username}")
    public ResponseEntity<?> getBlogsByAuthor(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()) {
            List<Blog> blogs = blogService.findBlogsByAuthor(user.get());
            return ResponseEntity.ok(blogs);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/genre/{genreName}")
    public ResponseEntity<?> getBlogsByGenre(@PathVariable String genreName) {
        List<Blog> blogs = blogService.findBlogsByGenreName(genreName);
        return ResponseEntity.ok(blogs);
    }

    @PostMapping
    public ResponseEntity<?> createBlog(@RequestBody Map<String, Object> blogRequest, HttpServletRequest request) {
        try {
            // Get the current authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            HttpSession session = request.getSession(false);

            // Debug logs
            System.out.println("Creating blog with authentication: " + (authentication != null ? authentication.getName() : "null"));
            System.out.println("Session ID: " + (session != null ? session.getId() : "null"));
            System.out.println("Is authenticated: " + (authentication != null && authentication.isAuthenticated()));
            System.out.println("Principal: " + (authentication != null ? authentication.getPrincipal() : "null"));

            if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You must be logged in to create a blog");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String username = authentication.getName();
            System.out.println("Username from authentication: " + username);

            Optional<User> user = userService.findByUsername(username);

            if (!user.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            System.out.println("Found user: " + user.get().getUsername());

            Blog blog = new Blog();
            blog.setTitle((String) blogRequest.get("title"));
            blog.setContent((String) blogRequest.get("content"));

            // Process genre IDs
            Set<Genre> genres = new HashSet<>();
            if (blogRequest.get("genreIds") != null) {
                @SuppressWarnings("unchecked")
                List<Integer> genreIds = (List<Integer>) blogRequest.get("genreIds");
                System.out.println("Genre IDs: " + genreIds);

                if (genreIds.isEmpty()) {
                    // If no genres selected, add a default genre
                    Optional<Genre> defaultGenre = genreService.findByName("General");
                    if (defaultGenre.isPresent()) {
                        genres.add(defaultGenre.get());
                        System.out.println("Added default genre: General");
                    } else {
                        // Create a default genre if it doesn't exist
                        Genre newGenre = new Genre();
                        newGenre.setName("General");
                        Genre savedGenre = genreService.createGenre(newGenre);
                        genres.add(savedGenre);
                        System.out.println("Created and added default genre: General");
                    }
                } else {
                    for (Integer genreId : genreIds) {
                        Optional<Genre> genre = genreService.findById(genreId.longValue());
                        if (genre.isPresent()) {
                            genres.add(genre.get());
                            System.out.println("Added genre: " + genre.get().getName());
                        }
                    }
                }
            }

            Blog createdBlog = blogService.createBlog(blog, user.get(), genres);
            System.out.println("Blog created with ID: " + createdBlog.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdBlog);
        } catch (Exception e) {
            // Debug log
            System.out.println("Error creating blog: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Other methods remain the same...
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(@PathVariable Long id, @RequestBody Map<String, Object> blogRequest, Authentication authentication) {
        try {
            if (authentication == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You must be logged in to update a blog");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String username = authentication.getName();
            Optional<Blog> existingBlog = blogService.findById(id);

            if (!existingBlog.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Blog not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Check if the authenticated user is the author
            if (!existingBlog.get().getAuthor().getUsername().equals(username)) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You are not authorized to update this blog");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            Blog blog = existingBlog.get();
            blog.setTitle((String) blogRequest.get("title"));
            blog.setContent((String) blogRequest.get("content"));

            // Process genre IDs
            Set<Genre> genres = new HashSet<>();
            if (blogRequest.get("genreIds") != null) {
                @SuppressWarnings("unchecked")
                List<Integer> genreIds = (List<Integer>) blogRequest.get("genreIds");
                for (Integer genreId : genreIds) {
                    genreService.findById(genreId.longValue()).ifPresent(genres::add);
                }
            }

            Blog updatedBlog = blogService.updateBlog(blog, genres);
            return ResponseEntity.ok(updatedBlog);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You must be logged in to delete a blog");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String username = authentication.getName();
            Optional<Blog> existingBlog = blogService.findById(id);

            if (!existingBlog.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Blog not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Check if the authenticated user is the author
            if (!existingBlog.get().getAuthor().getUsername().equals(username)) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You are not authorized to delete this blog");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            blogService.deleteBlog(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Blog deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(@PathVariable Long id, @RequestBody Map<String, Boolean> voteRequest, Authentication authentication) {
        try {
            if (authentication == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You must be logged in to vote");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String username = authentication.getName();
            Optional<User> user = userService.findByUsername(username);
            Optional<Blog> blog = blogService.findById(id);

            if (!user.isPresent() || !blog.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User or blog not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Boolean isUpvote = voteRequest.get("upvote");
            if (isUpvote == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Upvote parameter is required");
                return ResponseEntity.badRequest().body(response);
            }

            voteService.vote(user.get(), blog.get(), isUpvote);

            // Refresh blog to get updated vote counts
            blog = blogService.findById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vote recorded successfully");
            response.put("upvoteCount", blog.get().getUpvoteCount());
            response.put("downvoteCount", blog.get().getDownvoteCount());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
