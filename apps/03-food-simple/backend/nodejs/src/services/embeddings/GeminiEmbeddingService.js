import axios from 'axios';
import EmbeddingInterface from './EmbeddingInterface.js';

class GeminiEmbeddingService extends EmbeddingInterface {
  constructor() {
    super();
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_EMBEDDING_MODEL || 'embedding-001';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    this.axios = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey
      },
    });
  }

  async getEmbedding(text) {
    try {
      const response = await this.axios.post(
        `${this.baseUrl}/${this.model}:embedContent`,
        {
          content: {
            parts: [{ text }]
          }
        }
      );

      if (!response.data?.embedding?.values) {
        throw new Error('No embedding returned from Gemini API');
      }

      return response.data.embedding.values;
    } catch (error) {
      throw new Error(`Error getting embeddings from Gemini API: ${error.message}`);
    }
  }

  getProvider() {
    return 'gemini';
  }

  getModel() {
    return this.model;
  }
}

export default GeminiEmbeddingService; 