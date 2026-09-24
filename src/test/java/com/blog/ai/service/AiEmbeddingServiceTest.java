package com.blog.ai.service;

import com.blog.repository.BlogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class AiEmbeddingServiceTest {

    @Mock
    private BlogRepository blogRepository;

    @Test
    void shouldCreateSimilarEmbeddingsForRelatedTravelQueries() {
        AiEmbeddingService service = new AiEmbeddingService(blogRepository);

        List<Double> first = service.generateEmbedding("peaceful mountain destinations near Delhi");
        List<Double> second = service.generateEmbedding("mountain getaways close to Delhi");

        double similarity = service.cosineSimilarity(first, second);

        assertTrue(similarity > 0.5, "Expected related travel queries to have meaningful similarity");
    }
}
