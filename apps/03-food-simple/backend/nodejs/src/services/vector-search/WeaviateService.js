import weaviate from 'weaviate-client';
import { generativeParameters} from 'weaviate-client';
import VectorSearchInterface from './VectorSearchInterface.js';

class WeaviateService extends VectorSearchInterface {
  constructor() {
    super();
    this.url = process.env.WEAVIATE_URL || 'host.docker.internal';
    this.defaultClass = 'Recipe';
  }

  async connectToWeaviate() {
    this.client = await weaviate.connectToLocal({
      host: this.url,
      port: 8080,
      grpcPort: 50051,
      headers: {
        'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY
      }
    });
  }
  async searchByText(text, collection, limit = 5, returnContent = false) {
    try {
      // Use Weaviate's text search capabilities
      await this.connectToWeaviate();
      const myCollection = this.client.collections.get(collection);
      const response = await myCollection.query
        .nearText(text,{ limit: limit});


      const results = response.objects;
      if (returnContent) {
        return results.map(item => ({
          filename: item.properties.filename,
          content: item.properties.content
        }));
      } else {
        return results.map(item => item.filename);
      }
    } catch (error) {
      console.error(`Error searching by text in Weaviate class ${this.defaultClass}:`, error);
      throw new Error(`Error searching by text in Weaviate: ${error.message}`);
    }
  }

  async generateAnswer(question, collection = this.defaultClass) {
    try {
      await this.connectToWeaviate();
      const prompt = `You are an expert chef with extensive experience working in kitchens around the world.\nYou have a deep knowledge of cooking techniques, ingredients, and culinary traditions from various cultures. \nYou are given a question about cooking or recipes and relevant recipe information.\n Please answer the question based ONLY on the information provided in the context. \n  You do not generate any information outside of the context. \nIf you do not know the answer based on the provided context, just say (I do not have enough information to answer this question.)\n <question>${question}</question>`;

      const myCollection = this.client.collections.use(collection);
      const response = await myCollection.generate.nearText(question,{
        groupedTask: {prompt: prompt},
        config: generativeParameters.openAI({ model: "gpt-3.5-turbo"}),
      },{
        limit: 5
      });
      
      return response.generative?.text
      
    } catch (error) {
      console.error(`Error generating answer in Weaviate class ${collection}:`, error);
      throw new Error(`Error generating answer in Weaviate: ${error.message}`);
    }
  }

  getProvider() {
    return 'weaviate';
  }
}

export default WeaviateService; 