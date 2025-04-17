import { Client } from '@elastic/elasticsearch';
import VectorSearchInterface from './VectorSearchInterface.js';
import { embeddingService } from '../embeddingService.js';

class ElasticsearchService extends VectorSearchInterface {
  constructor() {
    super();
    this.url = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    this.client = new Client({
      node: this.url,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
      }
    });
    this.defaultIndex = 'recipes';
  }

  async searchByText(text, collection, limit = 5, returnContent = false) {
    try {
      const embedding = await embeddingService.getEmbedding(text, 'ollama');
      
      // Use the embedding for vector search
      const response = await this.client.search({
        index: this.defaultIndex,
        body: {
          size: limit,
          query: {
            script_score: {
              query: { match_all: {} },
              script: {
                source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                params: { query_vector: embedding }
              }
            }
          }
        }
      });

      if (returnContent) {
        return response.hits.hits.map(hit => ({
          filename: hit._source.filename,
          content: hit._source.content
        }));
      } else {
        return response.hits.hits.map(hit => hit._source.filename);
      }
    } catch (error) {
      console.error(`Error searching by text in Elasticsearch index ${this.defaultIndex}:`, error);
      throw new Error(`Error searching by text in Elasticsearch: ${error.message}`);
    }
  }

  getProvider() {
    return 'elasticsearch';
  }
}

export default ElasticsearchService; 