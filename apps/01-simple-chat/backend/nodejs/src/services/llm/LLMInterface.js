/**
 * Interface for LLM providers
 * All provider implementations must implement this interface
 */
class LLMInterface {
  /**
   * Send a message to the LLM provider and get a response
   * @param {string} message - The message to send
   * @returns {Promise<string>} - The response from the LLM
   * @throws {Error} - If there is an error communicating with the API
   */
  async sendMessage(message) {
    throw new Error('Method not implemented');
  }

  /**
   * Get the name of the LLM provider
   * @returns {string} - The name of the provider
   */
  getProvider() {
    throw new Error('Method not implemented');
  }

  /**
   * Get the model name used by the LLM provider
   * @returns {string} - The model name
   */
  getModel() {
    throw new Error('Method not implemented');
  }
}

export default LLMInterface; 