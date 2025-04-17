import pg from 'pg';
import VectorSearchInterface from './VectorSearchInterface.js';

class PostgresService extends VectorSearchInterface {
  constructor() {
    super();
    this.client = new pg.Client({
      host: process.env.POSTGRES_HOST || 'host.docker.internal',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'vectordb',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres'
    });
    this.defaultTable = 'recipes';
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
      throw new Error(`Error connecting to PostgreSQL: ${error.message}`);
    }
  }

  async searchByText(text, collection, limit = 5, returnContent = false) {
    try {
      const query = `SELECT
      chunk,
      embedding <=> ai.ollama_embed('nomic-embed-text', $1) AS distance
      FROM public.${this.defaultTable}_embedding_store
      ORDER BY distance
      LIMIT $2;`
      const result = await this.client.query(query, [text, limit]);
      
      if (returnContent) {
        return result.rows.map(row => ({
          filename: "",
          content: row.chunk
        }));
      } else {
        return result.rows.map(row => row.filename);
      }
    } catch (error) {
      console.error(`Error searching by text in PostgreSQL table ${this.defaultTable}:`, error);
      throw new Error(`Error searching by text in PostgreSQL: ${error.message}`);
    }
  }

  getProvider() {
    return 'postgres';
  }
}

export default PostgresService; 