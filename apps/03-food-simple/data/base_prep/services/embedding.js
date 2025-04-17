import { pipeline } from '@xenova/transformers';

class EmbeddingService {
  constructor() {
    this.embedder = null;
  }

  async getEmbedder() {
    if (!this.embedder) {
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return this.embedder;
  }

  async generateEmbedding(text) {
    const embedder = await this.getEmbedder();
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}

export const embeddingService = new EmbeddingService(); 