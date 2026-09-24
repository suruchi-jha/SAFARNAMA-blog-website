package com.blog.repository;

import com.blog.model.AiConversationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiConversationSessionRepository extends JpaRepository<AiConversationSession, Long> {
    Optional<AiConversationSession> findByUserId(String userId);
}
