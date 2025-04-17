import { llmService } from '../services/llmService.js';

export const chatController = {
  async chat(req, res) {
    try {
      const { message, provider = 'ollama' } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await llmService.generateResponse(message, provider);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async providers(req, res) {
    try {
      const providers = llmService.getAvailableProviders();
      res.json({ providers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async switchProvider(req, res) {
    try {
      const { provider } = req.body;

      if (!provider) {
        return res.status(400).json({ error: 'Provider is required' });
      }

      if (!llmService.isProviderAvailable(provider)) {
        return res.status(400).json({ error: 'Provider not available' });
      }

      res.json({ message: 'Provider switched successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 