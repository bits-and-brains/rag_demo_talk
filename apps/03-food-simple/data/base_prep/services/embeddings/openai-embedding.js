import OpenAI from 'openai';
import { BaseEmbeddingService } from './base-embedding.js';

export class OpenAIEmbeddingService extends BaseEmbeddingService {
  constructor() {
    super();
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async getEmbedding(text) {
    try {
      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error getting OpenAI embedding:', error);
      throw error;
    }
  }
} 