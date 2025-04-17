import OllamaEmbeddingService from './embeddings/OllamaEmbeddingService.js';
import OpenAIEmbeddingService from './embeddings/OpenAIEmbeddingService.js';
import GeminiEmbeddingService from './embeddings/GeminiEmbeddingService.js';

class EmbeddingService {
  constructor() {
    this.providers = {
      ollama: {
        name: 'Ollama',
        enabled: true,
        model: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
      },
      openai: {
        name: 'OpenAI',
        enabled: true,
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      },
      gemini: {
        name: 'Google Gemini',
        enabled: true,
        model: process.env.GEMINI_EMBEDDING_MODEL || 'embedding-001',
      },
    };

    // Initialize service instances map but don't create instances yet
    this.serviceInstances = {};
  }

  getAvailableProviders() {
    return Object.entries(this.providers)
      .filter(([_, provider]) => provider.enabled)
      .reduce((acc, [key, provider]) => {
        acc[key] = {
          name: provider.name,
          enabled: provider.enabled,
          model: provider.model
        };
        return acc;
      }, {});
  }

  isProviderAvailable(provider) {
    return this.providers[provider]?.enabled || false;
  }

  // Get a service instance, creating it if it doesn't exist
  getServiceInstance(provider) {
    if (!this.serviceInstances[provider]) {
      switch (provider) {
        case 'ollama':
          this.serviceInstances[provider] = new OllamaEmbeddingService();
          break;
        case 'openai':
          this.serviceInstances[provider] = new OpenAIEmbeddingService();
          break;
        case 'gemini':
          this.serviceInstances[provider] = new GeminiEmbeddingService();
          break;
        default:
          throw new Error(`Unknown embedding provider: ${provider}`);
      }
    }
    return this.serviceInstances[provider];
  }

  async getEmbedding(text, provider = 'ollama') {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`Embedding provider ${provider} is not available`);
    }

    try {
      const service = this.getServiceInstance(provider);
      return await service.getEmbedding(text);
    } catch (error) {
      throw new Error(`Error getting embedding with ${provider}: ${error.message}`);
    }
  }
}

export const embeddingService = new EmbeddingService(); 