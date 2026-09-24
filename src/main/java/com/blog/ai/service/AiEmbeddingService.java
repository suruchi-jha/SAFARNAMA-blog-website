package com.blog.ai.service;

import com.blog.model.Blog;
import com.blog.repository.BlogRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiEmbeddingService {

    private static final int EMBEDDING_DIMENSIONS = 32;
    private final BlogRepository blogRepository;

    public AiEmbeddingService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    public List<Double> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return Collections.nCopies(EMBEDDING_DIMENSIONS, 0.0);
        }

        String normalized = text.toLowerCase(Locale.ROOT);
        Pattern pattern = Pattern.compile("[a-zA-Z']+");
        Matcher matcher = pattern.matcher(normalized);

        double[] vector = new double[EMBEDDING_DIMENSIONS];
        int tokenCount = 0;

        while (matcher.find()) {
            String token = matcher.group();
            if (token.length() < 2) {
                continue;
            }
            int hash = Math.abs(token.hashCode());
            int index = hash % EMBEDDING_DIMENSIONS;
            vector[index] += 1.0;
            tokenCount++;
        }

        if (tokenCount == 0) {
            return Collections.nCopies(EMBEDDING_DIMENSIONS, 0.0);
        }

        double magnitude = 0.0;
        for (double value : vector) {
            magnitude += value * value;
        }
        magnitude = Math.sqrt(magnitude);

        for (int i = 0; i < vector.length; i++) {
            vector[i] = vector[i] / magnitude;
        }

        return Arrays.stream(vector).boxed().collect(Collectors.toList());
    }

    public double cosineSimilarity(List<Double> left, List<Double> right) {
        if (left == null || right == null || left.size() != right.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double leftMagnitude = 0.0;
        double rightMagnitude = 0.0;

        for (int i = 0; i < left.size(); i++) {
            double lv = left.get(i);
            double rv = right.get(i);
            dotProduct += lv * rv;
            leftMagnitude += lv * lv;
            rightMagnitude += rv * rv;
        }

        if (leftMagnitude == 0.0 || rightMagnitude == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
    }

    public List<Blog> findRelevantBlogs(String query, int limit) {
        List<Blog> blogs = blogRepository.findAll();
        List<Double> queryEmbedding = generateEmbedding(query);

        return blogs.stream()
                .filter(blog -> blog.getTitle() != null || blog.getContent() != null)
                .map(blog -> {
                    String combined = String.join(" ",
                            Optional.ofNullable(blog.getTitle()).orElse(""),
                            Optional.ofNullable(blog.getContent()).orElse(""));
                    List<Double> blogEmbedding = generateEmbedding(combined);
                    double similarity = cosineSimilarity(queryEmbedding, blogEmbedding);
                    return new AbstractMap.SimpleEntry<>(blog, similarity);
                })
                .filter(entry -> entry.getValue() > 0.05)
                .sorted(Map.Entry.<Blog, Double>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
