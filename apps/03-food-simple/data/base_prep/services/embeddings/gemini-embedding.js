import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseEmbeddingService } from './base-embedding.js';

export class GeminiEmbeddingService extends BaseEmbeddingService {
  constructor() {
    super();
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "embedding-001" });
  }

  async getEmbedding(text) {
    try {
      // Add retry logic for network issues
      let retries = 3;
      let lastError = null;
      
      while (retries > 0) {
        try {
          const result = await this.model.embedContent(text);
          const embedding = await result.embedding;
          return embedding.values;
        } catch (error) {
          lastError = error;
          console.warn(`Gemini embedding attempt failed (${retries} retries left):`, error.message);
          retries--;
          
          // Wait before retrying (exponential backoff)
          if (retries > 0) {
            const delay = Math.pow(2, 3 - retries) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('All Gemini embedding attempts failed:', lastError);
      throw lastError;
    } catch (error) {
      console.error('Error getting Gemini embedding:', error);
      throw error;
    }
  }
} 