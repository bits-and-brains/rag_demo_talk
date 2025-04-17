import axios from 'axios';
import EmbeddingInterface from './EmbeddingInterface.js';

class OllamaEmbeddingService extends EmbeddingInterface {
  constructor() {
    super();
    this.baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    this.axios = null;
    this.initializeAxios();
  }

  async initializeAxios() {
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getEmbedding(text) {
    try {
      const response = await this.axios.post('/api/embeddings', {
        model: this.model,
        prompt: text
      });

      if (!response.data?.embedding) {
        throw new Error('No embedding returned from Ollama API');
      }

      return response.data.embedding;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Could not connect to Ollama server. Please ensure Ollama is running.');
      }
      throw new Error(`Error getting embeddings from Ollama API: ${error.message}`);
    }
  }

  getProvider() {
    return 'ollama';
  }

  getModel() {
    return this.model;
  }
}

export default OllamaEmbeddingService; 