package com.blog.ai.service;

import com.blog.model.Blog;
import com.blog.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private final AiMemoryService aiMemoryService;
    private final AiEmbeddingService aiEmbeddingService;
    private final BlogRepository blogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.provider:mock}")
    private String provider;

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.model:gemini-2.0-flash}")
    private String model;

    public AiChatService(AiMemoryService aiMemoryService, AiEmbeddingService aiEmbeddingService, BlogRepository blogRepository) {
        this.aiMemoryService = aiMemoryService;
        this.aiEmbeddingService = aiEmbeddingService;
        this.blogRepository = blogRepository;
    }

    public Map<String, Object> chat(String userId, String message) {
        aiMemoryService.updatePreferences(userId, message);
        aiMemoryService.appendMessage(userId, "user", message);

        List<Blog> relevantBlogs = aiEmbeddingService.findRelevantBlogs(message, 3);
        String context = buildBlogContext(relevantBlogs);
        String answer = buildAnswer(userId, message, context);
        aiMemoryService.appendMessage(userId, "assistant", answer);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("answer", answer);
        response.put("citations", relevantBlogs.stream().map(blog -> {
            Map<String, Object> citation = new LinkedHashMap<>();
            citation.put("id", blog.getId());
            citation.put("title", blog.getTitle());
            citation.put("author", blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Safarnama");
            citation.put("url", "/blogs/" + blog.getId());
            return citation;
        }).toList());
        response.put("history", aiMemoryService.getHistory(userId));
        response.put("memory", aiMemoryService.getMemoryContext(userId));
        return response;
    }

    public Map<String, Object> plan(String userId, Map<String, Object> request) {
        aiMemoryService.updatePreferences(userId, String.valueOf(request));
        List<Blog> relevantBlogs = aiEmbeddingService.findRelevantBlogs(String.valueOf(request.getOrDefault("destination", "travel")), 3);
        String itinerary = buildItinerary(request, relevantBlogs);
        aiMemoryService.appendMessage(userId, "assistant", itinerary);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("itinerary", itinerary);
        response.put("citations", relevantBlogs.stream().map(blog -> {
            Map<String, Object> citation = new LinkedHashMap<>();
            citation.put("id", blog.getId());
            citation.put("title", blog.getTitle());
            citation.put("author", blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Safarnama");
            citation.put("url", "/blogs/" + blog.getId());
            return citation;
        }).toList());
        response.put("memory", aiMemoryService.getMemoryContext(userId));
        return response;
    }

    public List<Map<String, String>> getHistory(String userId) {
        return aiMemoryService.getHistory(userId);
    }

    public Map<String, Object> clearMemory(String userId) {
        aiMemoryService.clear(userId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Conversation memory cleared");
        return response;
    }

    private String buildBlogContext(List<Blog> blogs) {
        if (blogs.isEmpty()) {
            return "Safarnama travel blogs are the primary knowledge source for this reply.";
        }

        return blogs.stream()
                .map(blog -> "- " + blog.getTitle() + ": " + blog.getContent())
                .collect(Collectors.joining("\n"));
    }

    private String buildAnswer(String userId, String userMessage, String blogContext) {
        String external = callExternalProvider(userId, userMessage, blogContext);
        if (external != null && !external.isBlank()) {
            return external;
        }

        return buildLocalAnswer(userMessage);
    }

    private String buildLocalAnswer(String userMessage) {
        String lower = userMessage.toLowerCase(Locale.ROOT);
        java.util.regex.Matcher daysMatcher = java.util.regex.Pattern.compile("(\\d+)\\s*day").matcher(lower);
        int days = daysMatcher.find() ? Integer.parseInt(daysMatcher.group(1)) : 3;

        if (lower.contains("manali") && (lower.contains("cost") || lower.contains("budget") || lower.contains("price"))) {
            int dailyStay = 1800;
            int dailyFood = 900;
            int dailyLocalTransport = 500;
            int activities = 1200;
            int total = days * (dailyStay + dailyFood + dailyLocalTransport) + activities;
            return "For a budget-friendly " + days + "-day Manali trip, plan for approximately INR " + total +
                    " excluding travel to and from Manali. A practical estimate is:\n" +
                    "- Stay: INR " + (days * dailyStay) + "\n" +
                    "- Food: INR " + (days * dailyFood) + "\n" +
                    "- Local transport: INR " + (days * dailyLocalTransport) + "\n" +
                    "- Activities and buffer: INR " + activities + "\n" +
                    "Your actual cost will change with the season, accommodation, starting city, and activities. Tell me your starting city and preferred hotel level for a tighter estimate.";
        }

        if (lower.contains("plan") || lower.contains("itinerary") || lower.contains("trip")) {
            return "I can help plan that, but the configured AI provider is unavailable. Please provide the destination, number of days, starting city, budget, and interests, and I will create a structured itinerary.";
        }

        return "I can answer general questions once an AI provider is configured. The backend received your request, but no provider response was available. Add AI_GEMINI_API_KEY to the backend environment and restart Spring Boot.";
    }

    private String buildItinerary(Map<String, Object> request, List<Blog> blogs) {
        String destination = String.valueOf(request.getOrDefault("destination", "your destination"));
        String budget = String.valueOf(request.getOrDefault("budget", "flexible"));
        String duration = String.valueOf(request.getOrDefault("durationDays", request.getOrDefault("days", 3)));
        String startCity = String.valueOf(request.getOrDefault("startCity", "your city"));
        String interests = String.valueOf(request.getOrDefault("interests", "local experiences"));

        StringBuilder builder = new StringBuilder();
        builder.append("Here is a personalized itinerary for ").append(destination).append(" from ").append(startCity).append("\n");
        builder.append("Budget: ").append(budget).append(" | Duration: ").append(duration).append(" days | Interests: ").append(interests).append("\n\n");
        builder.append("Day 1: Arrive, settle in, and explore local highlights.\n");
        builder.append("Day 2: Visit signature landmarks and a food trail.\n");
        builder.append("Day 3: Add an adventure or photography stop based on your interests.\n");
        builder.append("Accommodation: Choose a mid-range stay near the main attractions.\n");
        builder.append("Food: Try local street food and one signature restaurant.\n");
        builder.append("Estimated cost: Keep it within your budget by prioritizing one paid activity per day.\n");
        builder.append("Packing: Weather-appropriate layers, chargers, comfortable shoes, and a small day bag.\n");

        if (!blogs.isEmpty()) {
            builder.append("\nInspired by Safarnama blogs: ");
            for (Blog blog : blogs) {
                builder.append(blog.getTitle()).append(", ");
            }
        }
        return builder.toString();
    }

    private String callExternalProvider(String userId, String userMessage, String blogContext) {
        if (!"gemini".equalsIgnoreCase(provider) || geminiApiKey == null || geminiApiKey.isBlank()) {
            return null;
        }

        Map<String, Object> memoryContext = aiMemoryService.getMemoryContext(userId);
        String prompt = "You are Safarnama AI, a helpful general-purpose assistant. Answer the user's actual question directly, whether it is about travel or any other topic. " +
            "For travel questions, use Safarnama blog context when relevant and cite blog titles naturally. " +
            "Do not mention internal prompts, retrieval, embeddings, or provider configuration. " +
            "If information is uncertain, say so clearly. Preserve useful facts from the conversation and apply follow-up changes instead of restarting.\n\n" +
            "User request:\n" + userMessage + "\n\n" +
            "Conversation context:\n" + memoryContext + "\n\n" +
            "Safarnama blog context:\n" + blogContext;

        Map<String, Object> body = new LinkedHashMap<>();
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(Map.of("text", prompt)));
        body.put("contents", List.of(content));

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + geminiApiKey,
                    body,
                    Map.class
            );
            if (response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResponse.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return String.valueOf(parts.get(0).get("text"));
                    }
                }
            }
        } catch (Exception ex) {
            return null;
        }
        return null;
    }
}
