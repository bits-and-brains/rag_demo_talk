import { llmService } from '../services/llmService.js';
import { markdownService } from '../services/markdownService.js';


function generatePrompt(message, markdownFiles) {
  return `You are a helpful team lead. You are given a question and  information about the team members. Please answer the question based on the information provided.
    You provide answer only based on the information provided in the context.
    You do not generate any information outside of the context.
    If you do not know the answer, just say "I do not know".
    <question>${message}</question>\n\n
    <context>${markdownFiles.map(file => '<'+file.filename+'>'+file.content+'</'+file.filename+'>').join('\n\n')}</context>`
};

export const chatController = {
  async chat(req, res) {
    try {
      const { message, provider = 'ollama' } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const markdownFiles = await markdownService.readAllMarkdownFiles();
      const prompt = generatePrompt(message, markdownFiles);
      const response = await llmService.generateResponse(prompt, provider);
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