package com.blog.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SPAController {

    // Forward all routes to the index.html for the SPA to handle
    @GetMapping(value = {
            "/",
            "/login",
            "/signup",
            "/dashboard",
            "/explore",
            "/blogs/**",
            "/users/**",
            "/search/**",
            "/profile/**"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
