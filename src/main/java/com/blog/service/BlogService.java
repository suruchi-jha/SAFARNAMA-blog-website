package com.blog.service;

import com.blog.model.Blog;
import com.blog.model.Genre;
import com.blog.model.User;
import com.blog.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    public Blog createBlog(Blog blog, User author, Set<Genre> genres) {
        blog.setAuthor(author);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setGenres(genres);
        return blogRepository.save(blog);
    }

    public Optional<Blog> findById(Long id) {
        return blogRepository.findById(id);
    }

    public List<Blog> findAllBlogs() {
        return blogRepository.findAll();
    }

    public List<Blog> findPopularBlogs() {
        try {
            return blogRepository.findPopularBlogs();
        } catch (Exception e) {
            // Fallback to all blogs if the custom query fails
            return blogRepository.findAll();
        }
    }

    public List<Blog> findBlogsByAuthor(User author) {
        return blogRepository.findByAuthor(author);
    }

    public List<Blog> findBlogsByGenre(Genre genre) {
        return blogRepository.findByGenresContaining(genre);
    }

    public List<Blog> findBlogsByGenreName(String genreName) {
        return blogRepository.findByGenreName(genreName);
    }

    public Blog updateBlog(Blog blog, Set<Genre> genres) {
        blog.setUpdatedAt(LocalDateTime.now());
        blog.setGenres(genres);
        return blogRepository.save(blog);
    }

    public void deleteBlog(Long id) {
        blogRepository.deleteById(id);
    }
}

