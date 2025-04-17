import QdrantService from './QdrantService.js';
import ElasticsearchService from './ElasticsearchService.js';
import PostgresService from './PostgresService.js';
import WeaviateService from './WeaviateService.js';

class VectorSearchFactory {
  constructor() {
    this.providers = {
      qdrant: {
        name: 'Qdrant',
        enabled: true,
        supportsEmbeddingSelection: true,
        requiresEmbedding: true,
        returnsContent: false
      },
      elasticsearch: {
        name: 'Elasticsearch',
        enabled: true,
        supportsEmbeddingSelection: false,
        requiresEmbedding: false,
        returnsContent: true
      },
      postgres: {
        name: 'PostgreSQL',
        enabled: true,
        supportsEmbeddingSelection: false,
        requiresEmbedding: false,
        returnsContent: true
      },
      weaviate: {
        name: 'Weaviate',
        enabled: true,
        supportsEmbeddingSelection: false,
        requiresEmbedding: false,
        returnsContent: true
      }
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
          supportsEmbeddingSelection: provider.supportsEmbeddingSelection,
          requiresEmbedding: provider.requiresEmbedding,
          returnsContent: provider.returnsContent
        };
        return acc;
      }, {});
  }

  isProviderAvailable(provider) {
    return this.providers[provider]?.enabled || false;
  }

  supportsEmbeddingSelection(provider) {
    return this.providers[provider]?.supportsEmbeddingSelection || false;
  }

  requiresEmbedding(provider) {
    return this.providers[provider]?.requiresEmbedding || false;
  }

  returnsContent(provider) {
    return this.providers[provider]?.returnsContent || false;
  }

  // Get a service instance, creating it if it doesn't exist
  getServiceInstance(provider) {
    if (!this.serviceInstances[provider]) {
      switch (provider) {
        case 'qdrant':
          this.serviceInstances[provider] = new QdrantService();
          break;
        case 'elasticsearch':
          this.serviceInstances[provider] = new ElasticsearchService();
          break;
        case 'postgres':
          this.serviceInstances[provider] = new PostgresService();
          break;
        case 'weaviate':
          this.serviceInstances[provider] = new WeaviateService();
          break;
        default:
          throw new Error(`Unknown vector search provider: ${provider}`);
      }
    }
    return this.serviceInstances[provider];
  }

  async searchByVector(vector, collection, provider = 'qdrant', limit = 5, returnContent = false) {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`Vector search provider ${provider} is not available`);
    }

    try {
      const service = this.getServiceInstance(provider);
      return await service.searchByVector(vector, collection, limit, returnContent);
    } catch (error) {
      throw new Error(`Error searching with ${provider}: ${error.message}`);
    }
  }

  async searchByText(text, collection, provider = 'qdrant', limit = 5, returnContent = false) {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`Vector search provider ${provider} is not available`);
    }

    try {
      const service = this.getServiceInstance(provider);
      return await service.searchByText(text, collection, limit, returnContent);
    } catch (error) {
      throw new Error(`Error searching by text with ${provider}: ${error.message}`);
    }
  }

  async generateAnswer(question, collection, provider = 'weaviate') {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`Vector search provider ${provider} is not available`);
    }

    try {
      const service = this.getServiceInstance(provider);
      return await service.generateAnswer(question, collection);
    } catch (error) {
      throw new Error(`Error generating answer with ${provider}: ${error.message}`);
    }
  }
}

export const vectorSearchFactory = new VectorSearchFactory(); 