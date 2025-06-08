package com.blog.controller.api;

import com.blog.model.User;
import com.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> register(@RequestBody Map<String, String> userRequest) {
        try {
            System.out.println("REST API: Register request received");
            System.out.println("Request body: " + userRequest);

            // Extract fields from the request
            String username = userRequest.get("username");
            String email = userRequest.get("email");
            String password = userRequest.get("password");

            System.out.println("Username: " + username);
            System.out.println("Email: " + email);
            System.out.println("Password received: " + (password != null ? "Yes" : "No"));
            System.out.println("Password length: " + (password != null ? password.length() : "null"));

            // Validate required fields
            if (username == null || username.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (email == null || email.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (password == null || password.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Password is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create user object
            User user = new User();
            user.setUsername(username.trim());
            user.setEmail(email.trim());
            user.setPassword(password);

            System.out.println("Creating user object: " + user.getUsername());

            User registeredUser = userService.registerUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("username", registeredUser.getUsername());
            response.put("email", registeredUser.getEmail());

            System.out.println("REST API: User registered successfully: " + registeredUser.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("REST API: Registration failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("REST API: Unexpected error during registration: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        try {
            System.out.println("REST API: Login request received");
            System.out.println("Request body: " + loginRequest);

            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            System.out.println("Username: " + username);
            System.out.println("Password received: " + (password != null ? "Yes" : "No"));

            if (username == null || username.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (password == null || password.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Password is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            System.out.println("REST API: Login attempt for user: " + username);

            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Set authentication in the security context
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Store authentication in the session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
            session.setMaxInactiveInterval(3600); // 60 minutes in seconds

            System.out.println("REST API: Login successful for user: " + username);
            System.out.println("REST API: Session ID: " + session.getId());
            System.out.println("REST API: Authentication in security context: " + SecurityContextHolder.getContext().getAuthentication().getName());

            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("id", user.getId());
            responseMap.put("username", user.getUsername());
            responseMap.put("email", user.getEmail());

            System.out.println("REST API: Returning login response for user: " + user.getUsername());
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            System.out.println("REST API: Login failed: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        HttpSession session = request.getSession(false);

        System.out.println("REST API: Auth check - Session ID: " + (session != null ? session.getId() : "null"));
        System.out.println("REST API: Auth check - Session exists: " + (session != null));
        System.out.println("REST API: Auth check - Auth: " + (auth != null ? auth.getName() : "null"));
        System.out.println("REST API: Auth check - Is authenticated: " + (auth != null && auth.isAuthenticated()));

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            System.out.println("REST API: Auth check: User is authenticated as " + auth.getName());

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("authenticated", true);
            responseMap.put("username", auth.getName());
            return ResponseEntity.ok(responseMap);
        } else {
            System.out.println("REST API: Auth check: User is not authenticated");

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("authenticated", false);
            return ResponseEntity.ok(responseMap);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        System.out.println("REST API: Logout request");

        // Invalidate the session if exists
        HttpSession session = request.getSession(false);
        if (session != null) {
            System.out.println("REST API: Invalidating session: " + session.getId());
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("message", "Logged out successfully");
        System.out.println("REST API: Logout successful");
        return ResponseEntity.ok(responseMap);
    }
}
