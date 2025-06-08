package com.blog.controller;

import com.blog.model.User;
import com.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auth/view") // Changed base path to avoid conflicts with REST controller
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/signup-form")
    public String showSignupForm(Model model) {
        model.addAttribute("user", new User());
        return "signup";
    }

    @PostMapping("/signup-process")
    public String signup(@ModelAttribute("user") User user) {
        try {
            userService.registerUser(user);
            return "redirect:/login?success";
        } catch (Exception e) {
            return "redirect:/signup?error=" + e.getMessage();
        }
    }

    @GetMapping("/login-form")
    public String showLoginForm() {
        return "login";
    }
}
