/**
 * Interface for vector search providers
 * All provider implementations must implement this interface
 */
class VectorSearchInterface {
  /**
   * Search for similar vectors in the collection
   * @param {Array<number>} vector - The vector to search for
   * @param {string} collection - The collection to search in
   * @param {number} limit - The maximum number of results to return
   * @param {boolean} returnContent - Whether to return content instead of filenames
   * @returns {Promise<Array>} - The search results (filenames or content objects)
   * @throws {Error} - If there is an error communicating with the API
   */
  async search(vector, collection, limit = 5, returnContent = false) {
    throw new Error('Method not implemented');
  }

  /**
   * Search for similar text in the collection
   * @param {string} text - The text to search for
   * @param {string} collection - The collection to search in
   * @param {number} limit - The maximum number of results to return
   * @param {boolean} returnContent - Whether to return content instead of filenames
   * @returns {Promise<Array>} - The search results (filenames or content objects)
   * @throws {Error} - If there is an error communicating with the API
   */
  async searchByText(text, collection, limit = 5, returnContent = false) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate an AI answer based on the question and relevant context from the collection
   * @param {string} question - The question to generate an answer for
   * @param {string} collection - The collection to search in
   * @returns {Promise<string>} - The AI-generated answer
   * @throws {Error} - If there is an error communicating with the API
   */
  async generateAnswer(question, collection) {
    throw new Error('Method not implemented');
  }

  /**
   * Get the name of the vector search provider
   * @returns {string} - The name of the provider
   */
  getProvider() {
    throw new Error('Method not implemented');
  }
}

export default VectorSearchInterface; 