import fetch from 'node-fetch';
import { BaseEmbeddingService } from './base-embedding.js';

export class OllamaEmbeddingService extends BaseEmbeddingService {
  constructor() {
    super();
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = 'nomic-embed-text';
  }

  async getEmbedding(text) {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error getting Ollama embedding:', error);
      throw error;
    }
  }
} 