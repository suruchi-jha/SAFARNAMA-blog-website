package com.blog.ai.service;

import com.blog.model.AiConversationSession;
import com.blog.repository.AiConversationSessionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiMemoryService {

    private final AiConversationSessionRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiMemoryService(AiConversationSessionRepository repository) {
        this.repository = repository;
    }

    public AiConversationSession getOrCreateSession(String userId) {
        return repository.findByUserId(userId).orElseGet(() -> {
            AiConversationSession session = new AiConversationSession();
            session.setUserId(userId);
            session.setMemory("{}");
            session.setPreferences("{}");
            session.setMessageHistory("[]");
            return repository.save(session);
        });
    }

    public void appendMessage(String userId, String role, String content) {
        AiConversationSession session = getOrCreateSession(userId);
        List<Map<String, String>> history = readMessages(session.getMessageHistory());
        Map<String, String> message = new LinkedHashMap<>();
        message.put("role", role);
        message.put("content", content);
        history.add(message);
        session.setMessageHistory(writeMessages(history));
        session.setUpdatedAt(LocalDateTime.now());
        repository.save(session);
    }

    public List<Map<String, String>> getHistory(String userId) {
        AiConversationSession session = getOrCreateSession(userId);
        return readMessages(session.getMessageHistory());
    }

    public Map<String, Object> getMemoryContext(String userId) {
        AiConversationSession session = getOrCreateSession(userId);
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("memory", readObject(session.getMemory(), new TypeReference<LinkedHashMap<String, Object>>() {}));
        context.put("preferences", readObject(session.getPreferences(), new TypeReference<LinkedHashMap<String, Object>>() {}));
        context.put("history", getHistory(userId));
        return context;
    }

    public void updatePreferences(String userId, String message) {
        AiConversationSession session = getOrCreateSession(userId);
        Map<String, Object> preferences = readObject(session.getPreferences(), new TypeReference<LinkedHashMap<String, Object>>() {});
        String lower = message.toLowerCase();

        if (lower.contains("budget") || lower.contains("cheap") || lower.contains("affordable") || lower.contains("luxury")) {
            if (lower.contains("cheap") || lower.contains("affordable") || lower.contains("budget")) {
                preferences.put("budgetLevel", "budget");
            } else if (lower.contains("luxury")) {
                preferences.put("budgetLevel", "luxury");
            }
        }

        if (lower.contains("day") || lower.contains("days")) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d+)").matcher(lower);
            if (matcher.find()) {
                preferences.put("durationDays", Integer.parseInt(matcher.group(1)));
            }
        }

        if (lower.contains("mountain")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "mountains"));
        }
        if (lower.contains("beach")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "beaches"));
        }
        if (lower.contains("adventure")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "adventure"));
        }
        if (lower.contains("food")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "food"));
        }
        if (lower.contains("nightlife")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "nightlife"));
        }
        if (lower.contains("family")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "family"));
        }
        if (lower.contains("photo")) {
            preferences.put("interests", addInterest((List<String>) preferences.getOrDefault("interests", new ArrayList<String>()), "photography"));
        }

        if (lower.contains("cheaper") || lower.contains("make it cheaper")) {
            preferences.put("budgetLevel", "budget");
        }
        if (lower.contains("replace") && lower.contains("trekking")) {
            preferences.put("activityAdjustment", "replace trekking with sightseeing");
        }
        if (lower.contains("add nightlife")) {
            preferences.put("activityAdjustment", "add nightlife");
        }

        session.setPreferences(writeObject(preferences));
        session.setUpdatedAt(LocalDateTime.now());
        repository.save(session);
    }

    public void clear(String userId) {
        AiConversationSession session = getOrCreateSession(userId);
        session.setMemory("{}");
        session.setPreferences("{}");
        session.setMessageHistory("[]");
        session.setUpdatedAt(LocalDateTime.now());
        repository.save(session);
    }

    private List<Map<String, String>> readMessages(String historyJson) {
        try {
            return objectMapper.readValue(historyJson, new TypeReference<List<Map<String, String>>>() {});
        } catch (Exception ex) {
            return new ArrayList<>();
        }
    }

    private String writeMessages(List<Map<String, String>> messages) {
        try {
            return objectMapper.writeValueAsString(messages);
        } catch (Exception ex) {
            return "[]";
        }
    }

    private <T> T readObject(String value, TypeReference<T> typeReference) {
        try {
            return objectMapper.readValue(value, typeReference);
        } catch (Exception ex) {
            return null;
        }
    }

    private String writeObject(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private List<String> addInterest(List<String> interests, String interest) {
        if (interests == null) {
            interests = new ArrayList<>();
        }
        if (!interests.contains(interest)) {
            interests.add(interest);
        }
        return interests;
    }
}
