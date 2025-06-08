package com.blog.controller;

import com.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class SearchController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public String searchUsers(@RequestParam("query") String query, Model model) {
        model.addAttribute("users", userService.searchUsers(query));
        model.addAttribute("searchQuery", query);
        return "search-results";
    }
}

