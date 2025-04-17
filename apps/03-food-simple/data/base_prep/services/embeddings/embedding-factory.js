import { OpenAIEmbeddingService } from './openai-embedding.js';
import { GeminiEmbeddingService } from './gemini-embedding.js';
import { OllamaEmbeddingService } from './ollama-embedding.js';

export class EmbeddingFactory {
  static getEmbeddingService(type) {
    switch (type.toLowerCase()) {
      case 'openai':
        return new OpenAIEmbeddingService();
      case 'gemini':
        return new GeminiEmbeddingService();
      case 'ollama':
        return new OllamaEmbeddingService();
      default:
        throw new Error(`Unsupported embedding type: ${type}`);
    }
  }
} 