package com.blog.repository;

import com.blog.model.Blog;
import com.blog.model.Genre;
import com.blog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByAuthor(User author);

    @Query("SELECT b FROM Blog b ORDER BY SIZE(b.votes) DESC")
    List<Blog> findPopularBlogs();

    List<Blog> findByGenresContaining(Genre genre);

    @Query("SELECT b FROM Blog b JOIN b.genres g WHERE g.name = ?1")
    List<Blog> findByGenreName(String genreName);
}

