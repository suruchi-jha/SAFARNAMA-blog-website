package com.blog.repository;

import com.blog.model.Blog;
import com.blog.model.User;
import com.blog.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserAndBlog(User user, Blog blog);
}

