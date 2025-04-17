import { QdrantClient } from '@qdrant/js-client-rest';

class QdrantService {
  constructor() {
    this.client = new QdrantClient({ url: 'http://localhost:6333' });
  }

  async createCollection(collectionName, vectorSize) {
    try {
      await this.client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine'
        }
      });
      console.log(`Collection ${collectionName} created successfully`);
      return true;
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Collection ${collectionName} already exists`);
        return true;
      } else {
        console.error(`Error creating collection ${collectionName}:`, error);
        return false;
      }
    }
  }

  async upsertPoints(collectionName, points) {
    try {
      await this.client.upsert(collectionName, {
        points: points
      });
      return true;
    } catch (error) {
      console.error(`Error upserting points to ${collectionName}:`, error);
      return false;
    }
  }

  async getCollectionInfo(collectionName) {
    try {
      return await this.client.getCollection(collectionName);
    } catch (error) {
      console.error(`Error getting collection info for ${collectionName}:`, error);
      return null;
    }
  }

  async deleteCollection(collectionName) {
    try {
      await this.client.deleteCollection(collectionName);
      console.log(`Collection ${collectionName} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting collection ${collectionName}:`, error);
      return false;
    }
  }

  async recreateCollection(collectionName, vectorSize) {
    await this.deleteCollection(collectionName);
    return await this.createCollection(collectionName, vectorSize);
  }
}

export const qdrantService = new QdrantService(); 