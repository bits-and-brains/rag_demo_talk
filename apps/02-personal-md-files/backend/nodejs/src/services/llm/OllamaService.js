import axios from 'axios';
import LLMInterface from './LLMInterface.js';

class OllamaService extends LLMInterface {
  constructor() {
    super();
    this.baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama2';
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

  async sendMessage(message) {
    try {
      const response = await this.axios.post('/api/generate', {
        model: this.model,
        prompt: message,
        stream: false,
      });

      if (!response.data?.response) {
        throw new Error('No response returned from Ollama API');
      }

      return response.data.response;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Could not connect to Ollama server. Please ensure Ollama is running.');
      }
      throw new Error(`Error communicating with Ollama API: ${error.message}`);
    }
  }

  getProvider() {
    return 'Ollama (Local)';
  }

  getModel() {
    return this.model;
  }
}

export default OllamaService; 