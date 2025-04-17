import axios from 'axios';
import EmbeddingInterface from './EmbeddingInterface.js';

class OpenAIEmbeddingService extends EmbeddingInterface {
  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
    });
  }

  async getEmbedding(text) {
    try {
      const response = await this.axios.post('/embeddings', {
        model: this.model,
        input: text
      });

      if (!response.data?.data?.[0]?.embedding) {
        throw new Error('No embedding returned from OpenAI API');
      }

      return response.data.data[0].embedding;
    } catch (error) {
      throw new Error(`Error getting embeddings from OpenAI API: ${error.message}`);
    }
  }

  getProvider() {
    return 'openai';
  }

  getModel() {
    return this.model;
  }
}

export default OpenAIEmbeddingService; 