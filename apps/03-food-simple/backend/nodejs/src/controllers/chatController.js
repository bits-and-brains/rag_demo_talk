import { llmService } from '../services/llmService.js';
import { markdownService } from '../services/markdownService.js';
import { embeddingService } from '../services/embeddingService.js';
import { vectorSearchFactory } from '../services/vector-search/VectorSearchFactory.js';

function generatePrompt(message, context) {
  return `You are an expert chef with extensive experience working in kitchens around the world. 
  You have a deep knowledge of cooking techniques, ingredients, and culinary traditions from various cultures.
  
  You are given a question about cooking or recipes and relevant recipe information. 
  Please answer the question based ONLY on the information provided in the context.
  
  You do not generate any information outside of the context.
  If you do not know the answer based on the provided context, just say "I do not have enough information to answer this question."
  
  <question>${message}</question>\n\n
  <context>${context}</context>`
};

export const chatController = {
  async chat(req, res) {
    try {
      const { message, provider, embeddingModel, vectorSearchProvider = 'qdrant' } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      let response;
      
      // Use Weaviate's generateAnswer for direct AI-generated responses
      // if (vectorSearchProvider === 'weaviate') {
      //   const collectionName = 'Recipe';
      //   response = await vectorSearchFactory.generateAnswer(message, collectionName, 'weaviate');
      // } else {
        let context = '';
        if (vectorSearchProvider === 'qdrant') {
          const embeddingM = embeddingModel || 'ollama';
          const collectionName = `recipes-${embeddingM}`;
          const embedding = await embeddingService.getEmbedding(message, embeddingM);

          const relevantRecipeFilenames = await vectorSearchFactory.searchByVector(embedding, collectionName, vectorSearchProvider);
          const relevantRecipes = await markdownService.readMarkdownFilesByNames(relevantRecipeFilenames);
          context = relevantRecipes.map(recipe => `<${recipe.filename}>${recipe.content}</${recipe.filename}>`).join('\n\n');
        } else {
          // For other providers, use hardcoded collection names and get content directly
          const collectionName = vectorSearchProvider === 'weaviate' ? 'Recipe' : 'recipes';
          const searchResults = await vectorSearchFactory.searchByText(message, collectionName, vectorSearchProvider, 5, true);

          // For other providers, content is already included in the results
          context = searchResults.map(result => result.content).join('\n\n');
        }

        // Generate prompt with the relevant recipes
        const prompt = generatePrompt(message, context);

        // Generate response using the selected LLM provider
        response = await llmService.generateResponse(prompt, provider);
      // }

      res.json({response});
    } catch (error) {
      console.error('Error in chat endpoint:', error);
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

  async embeddingModels(req, res) {
    try {
      const models = embeddingService.getAvailableProviders();
      res.json({ models });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async vectorSearchProviders(req, res) {
    try {
      const providers = vectorSearchFactory.getAvailableProviders();
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
