/**
 * Base message handler interface
 * All specific message handlers should implement this interface
 */
class MessageHandler {
  /**
   * Check if this handler can process the given message
   * @param {Object} message - The message to check
   * @returns {boolean} - True if this handler can process the message
   */
  canHandle(message) {
    throw new Error('Method not implemented');
  }

  /**
   * Process the message
   * @param {Object} message - The message to process
   * @param {Function} callback - Callback function to update UI or state
   */
  handle(message, callback) {
    throw new Error('Method not implemented');
  }
}

export default MessageHandler; 