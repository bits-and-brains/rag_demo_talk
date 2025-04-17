import OpenAIService from './llm/OpenAIService.js';
import GeminiService from './llm/GeminiService.js';
import OllamaService from './llm/OllamaService.js';

class LLMService {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI',
        enabled: true,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      },
      gemini: {
        name: 'Google Gemini',
        enabled: true,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      },
      ollama: {
        name: 'Ollama (Local)',
        enabled: true,
        model: process.env.OLLAMA_MODEL || 'llama2',
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
        case 'openai':
          this.serviceInstances[provider] = new OpenAIService();
          break;
        case 'gemini':
          this.serviceInstances[provider] = new GeminiService();
          break;
        case 'ollama':
          this.serviceInstances[provider] = new OllamaService();
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    }
    return this.serviceInstances[provider];
  }

  async generateResponse(message, provider = 'ollama') {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`Provider ${provider} is not available`);
    }

    try {
      const service = this.getServiceInstance(provider);
      return await service.sendMessage(message);
    } catch (error) {
      throw new Error(`Error generating response with ${provider}: ${error.message}`);
    }
  }
}

export const llmService = new LLMService(); 