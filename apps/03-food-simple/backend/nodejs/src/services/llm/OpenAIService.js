import axios from 'axios';
import LLMInterface from './LLMInterface.js';

class OpenAIService extends LLMInterface {
  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.axios = null;
    this.initializeAxios();
  }

  async initializeAxios() {
    this.axios = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async sendMessage(message) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await this.axios.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response choices returned from OpenAI API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('OpenAI API key is invalid. Please check your API key and try again.');
      }
      throw new Error(`Error communicating with OpenAI API: ${error.message}`);
    }
  }

  getProvider() {
    return 'OpenAI';
  }

  getModel() {
    return this.model;
  }
}

export default OpenAIService; 