import axios from 'axios';
import LLMInterface from './LLMInterface.js';

class GeminiService extends LLMInterface {
  constructor() {
    super();
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.axios = null;
    
    // Log environment variables for debugging
    console.log('GeminiService initialized with:');
    console.log('- API Key:', this.apiKey ? 'Set' : 'Not set');
    console.log('- Model:', this.model);
    
    this.initializeAxios();
  }

  async initializeAxios() {
    if (!this.apiKey) {
      console.error('Gemini API key is missing. Environment variables:');
      console.error('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
      console.error('- All env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
      throw new Error('Gemini API key is not configured');
    }

    this.axios = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
    });
  }

  async sendMessage(message) {
    try {
      const response = await this.axios.post(`/models/${this.model}:generateContent`, {
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response returned from Gemini API');
      }

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Invalid Gemini API key');
      }
      throw new Error(`Error communicating with Gemini API: ${error.message}`);
    }
  }

  getProvider() {
    return 'Google Gemini';
  }

  getModel() {
    return this.model;
  }
}

export default GeminiService; 