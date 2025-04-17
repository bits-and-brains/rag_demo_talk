import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

const INDEX_NAME = 'recipes';

export const elasticsearchService = {
  async createIndex() {
    try {
      const exists = await client.indices.exists({ index: INDEX_NAME });
      if (exists) {
        console.log('Index already exists');
        return;
      }

      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              filename: { type: 'keyword' },
              content: { type: 'text' },
              embedding: {
                type: 'dense_vector',
                dims: 768, // Default dimension for many embedding models
                index: true,
                similarity: 'cosine'
              }
            }
          }
        }
      });
      console.log('Index created successfully');
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }
  },

  async deleteIndex() {
    try {
      const exists = await client.indices.exists({ index: INDEX_NAME });
      if (exists) {
        await client.indices.delete({ index: INDEX_NAME });
        console.log('Index deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting index:', error);
      throw error;
    }
  },

  async addRecipes(recipes) {
    try {
      const operations = recipes.flatMap(recipe => [
        { index: { _index: INDEX_NAME } },
        {
          filename: recipe.filename,
          content: recipe.content,
          embedding: recipe.embedding
        }
      ]);

      const { items } = await client.bulk({ refresh: true, operations });
      const errors = items.filter(item => item.index?.error);
      
      if (errors.length > 0) {
        console.error('Some items failed to index:', errors);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding recipes:', error);
      return false;
    }
  }
}; 