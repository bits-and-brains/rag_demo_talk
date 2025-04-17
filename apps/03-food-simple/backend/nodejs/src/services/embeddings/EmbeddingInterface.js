/**
 * Interface for embedding providers
 * All provider implementations must implement this interface
 */
class EmbeddingInterface {
  /**
   * Get embeddings for the given text
   * @param {string} text - The text to get embeddings for
   * @returns {Promise<Array<number>>} - The embeddings
   * @throws {Error} - If there is an error communicating with the API
   */
  async getEmbedding(text) {
    throw new Error('Method not implemented');
  }

  /**
   * Get the name of the embedding provider
   * @returns {string} - The name of the provider
   */
  getProvider() {
    throw new Error('Method not implemented');
  }

  /**
   * Get the model name used by the embedding provider
   * @returns {string} - The model name
   */
  getModel() {
    throw new Error('Method not implemented');
  }
}

export default EmbeddingInterface; 