package com.blog.service;

import com.blog.model.Blog;
import com.blog.model.User;
import com.blog.model.Vote;
import com.blog.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    public Vote vote(User user, Blog blog, boolean isUpvote) {
        Optional<Vote> existingVote = voteRepository.findByUserAndBlog(user, blog);

        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            vote.setUpvote(isUpvote);
            return voteRepository.save(vote);
        } else {
            Vote vote = new Vote();
            vote.setUser(user);
            vote.setBlog(blog);
            vote.setUpvote(isUpvote);
            return voteRepository.save(vote);
        }
    }

    public void removeVote(User user, Blog blog) {
        Optional<Vote> existingVote = voteRepository.findByUserAndBlog(user, blog);
        existingVote.ifPresent(vote -> voteRepository.delete(vote));
    }
}

