package com.blog.controller.api;

import com.blog.ai.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiRestController {

    private final AiChatService aiChatService;

    public AiRestController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "You must be logged in to use the AI companion");
            return ResponseEntity.status(401).body(response);
        }

        String message = request.get("message");
        if (message == null || message.isBlank()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Message is required");
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok(aiChatService.chat(authentication.getName(), message));
    }

    @PostMapping("/plan")
    public ResponseEntity<?> plan(@RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "You must be logged in to use the AI companion");
            return ResponseEntity.status(401).body(response);
        }

        return ResponseEntity.ok(aiChatService.plan(authentication.getName(), request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, String>>> history() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(aiChatService.getHistory(authentication.getName()));
    }

    @PostMapping("/clear-memory")
    public ResponseEntity<?> clearMemory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "You must be logged in to use the AI companion");
            return ResponseEntity.status(401).body(response);
        }

        return ResponseEntity.ok(aiChatService.clearMemory(authentication.getName()));
    }
}
