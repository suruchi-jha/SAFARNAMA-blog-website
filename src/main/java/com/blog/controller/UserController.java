package com.blog.controller;

import com.blog.model.User;
import com.blog.service.BlogService;
import com.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.Optional;

@Controller
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BlogService blogService;

    @GetMapping("/profile")
    public String viewOwnProfile(Authentication authentication, Model model) {
        String username = authentication.getName();
        return "redirect:/users/" + username;
    }

    @GetMapping("/{username}")
    public String viewProfile(@PathVariable String username, Model model) {
        Optional<User> user = userService.findByUsername(username);

        if (user.isPresent()) {
            model.addAttribute("user", user.get());
            model.addAttribute("blogs", blogService.findBlogsByAuthor(user.get()));
            return "profile";
        } else {
            return "redirect:/dashboard";
        }
    }
}

