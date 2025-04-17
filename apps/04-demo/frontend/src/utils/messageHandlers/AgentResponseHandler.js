/**
 * Handler for agent response messages
 */
const AgentResponseHandler = {
  /**
   * Check if this handler can process the message
   * @param {Object} message - The message to check
   * @returns {boolean} - True if this handler can process the message
   */
  canHandle(message) {
    return message.type === 'agent_response';
  },

  /**
   * Handle the agent response message
   * @param {Object} message - The message to handle
   * @param {Function} addMessage - Callback to add a message to the chat
   */
  handle(message, addMessage) {
    if (addMessage && typeof addMessage === 'function') {
      // Add the agent response to the chat
      addMessage({
        type: 'agent',
        content: message.content,
        timestamp: message.timestamp
      });
    }
  }
};

export default AgentResponseHandler; 