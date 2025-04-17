import { QdrantClient } from '@qdrant/js-client-rest';
import VectorSearchInterface from './VectorSearchInterface.js';

class QdrantService extends VectorSearchInterface {
  constructor() {
    super();
    this.url = process.env.QDRANT_URL || 'http://localhost:6333';
    this.client = new QdrantClient({ url: this.url });
  }

  async searchByVector(vector, collection, limit = 5) {
    try {
      const searchResult = await this.client.search(collection, {
        vector: vector,
        limit: limit
      });

      return searchResult.map(result => result.payload.filename);
    } catch (error) {
      console.error(`Error searching in Qdrant collection ${collection}:`, error);
      throw new Error(`Error searching in Qdrant: ${error.message}`);
    }
  }

  getProvider() {
    return 'qdrant';
  }
}

export default QdrantService; 