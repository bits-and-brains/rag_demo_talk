import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';

dotenv.config();

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

const RECIPE_CLASS = 'Recipe';

export const weaviateService = {
  async createSchema() {
    try {
      const schema = {
        class: RECIPE_CLASS,
        vectorizer: 'text2vec-openai',
        moduleConfig: {
          'text2vec-openai': {
            model: 'ada',
            modelVersion: '002',
            type: 'text',
          },
        },
        properties: [
          {
            name: 'filename',
            dataType: ['string'],
          },
          {
            name: 'content',
            dataType: ['text'],
          },
        ],
      };

      await client.schema.classCreator().withClass(schema).do();
      console.log(`Created schema for ${RECIPE_CLASS}`);
      return true;
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`Schema ${RECIPE_CLASS} already exists`);
        return true;
      }
      console.error('Error creating schema:', error);
      return false;
    }
  },

  async deleteSchema() {
    try {
      await client.schema.classDeleter().withClassName(RECIPE_CLASS).do();
      console.log(`Deleted schema ${RECIPE_CLASS}`);
      return true;
    } catch (error) {
      console.error('Error deleting schema:', error);
      return false;
    }
  },

  async addRecipe(filename, content) {
    try {
      const properties = {
        filename,
        content,
      };

      await client.data.creator()
        .withClassName(RECIPE_CLASS)
        .withProperties(properties)
        .do();

      return true;
    } catch (error) {
      console.error('Error adding recipe:', error);
      return false;
    }
  },

  async addRecipes(recipes) {
    try {
      const batch = client.batch.objectsBatcher();
      let count = 0;

      for (const recipe of recipes) {
        const obj = {
          class: RECIPE_CLASS,
          properties: {
            filename: recipe.filename,
            content: recipe.content,
          },
        };

        batch.withObject(obj);
        count++;

        if (count % 100 === 0) {
          await batch.do();
          console.log(`Processed ${count} recipes`);
        }
      }

      if (count % 100 !== 0) {
        await batch.do();
      }

      console.log(`Successfully added ${count} recipes`);
      return true;
    } catch (error) {
      console.error('Error adding recipes:', error);
      return false;
    }
  },
}; 