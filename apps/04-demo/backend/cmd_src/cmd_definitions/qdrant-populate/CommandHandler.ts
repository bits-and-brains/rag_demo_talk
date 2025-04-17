import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Qdrant client
const qdrantClient = new QdrantClient({ 
  url: process.env.QDRANT_URL || 'http://localhost:6333' 
});

const COLLECTION_NAME = 'recipes-openai';

async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting OpenAI embedding:', error);
    throw error;
  }
}

async function processFile(filePath: string): Promise<any> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    const vector = await getEmbedding(content);
    
    return {
      id: uuidv4(),
      vector,
      payload: {
        filename: fileName
      }
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

async function createCollection(vectorSize: number) {
  try {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine'
      }
    });
    console.log(`Collection ${COLLECTION_NAME} created successfully`);
    return true;
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log(`Collection ${COLLECTION_NAME} already exists`);
      return true;
    } else {
      console.error(`Error creating collection ${COLLECTION_NAME}:`, error);
      return false;
    }
  }
}

async function deleteCollection() {
  try {
    await qdrantClient.deleteCollection(COLLECTION_NAME);
    console.log(`Collection ${COLLECTION_NAME} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting collection ${COLLECTION_NAME}:`, error);
    return false;
  }
}

async function recreateCollection(vectorSize: number) {
  await deleteCollection();
  return await createCollection(vectorSize);
}

async function upsertPoints(points: any[]) {
  try {
    await qdrantClient.upsert(COLLECTION_NAME, {
      points: points
    });
    return true;
  } catch (error) {
    console.error(`Error upserting points to ${COLLECTION_NAME}:`, error);
    return false;
  }
}

export async function handleCommand(options: any) {
  try {
    // Get all recipe files
    const dataStorePath = path.join(process.cwd(), 'data_store');
    const recipesDir = path.join(dataStorePath, 'recipes');
    
    // Check if recipes directory exists
    try {
      await fs.access(recipesDir);
    } catch (error) {
      console.error(`Recipes directory not found at ${recipesDir}`);
      return;
    }
    
    const files = await fs.readdir(recipesDir);
    const recipeFiles = files.filter(file => file.endsWith('.md'));
    
    if (recipeFiles.length === 0) {
      console.error('No recipe files found');
      return;
    }
    
    console.log(`Found ${recipeFiles.length} recipe files`);
    
    // Get vector size from the first file
    const firstFile = recipeFiles[0];
    const firstFilePath = path.join(recipesDir, firstFile);
    const firstFileContent = await fs.readFile(firstFilePath, 'utf-8');
    const firstVector = await getEmbedding(firstFileContent);
    const VECTOR_SIZE = firstVector.length;
    
    // Handle collection creation/recreation
    if (options.recreate) {
      console.log(`Recreating collection ${COLLECTION_NAME}...`);
      await recreateCollection(VECTOR_SIZE);
    } else {
      await createCollection(VECTOR_SIZE);
    }
    
    // Process files in batches
    const batchSize = options.batchSize || 5;
    const totalFiles = recipeFiles.length;
    let processedCount = 0;
    let successCount = 0;
    
    for (let i = 0; i < totalFiles; i += batchSize) {
      const batch = recipeFiles.slice(i, i + batchSize);
      const batchPoints = [];
      
      for (const file of batch) {
        processedCount++;
        const filePath = path.join(recipesDir, file);
        console.log(`Processing ${file} (${processedCount}/${totalFiles})...`);
        
        const point = await processFile(filePath);
        if (point) {
          batchPoints.push(point);
          successCount++;
        }
      }
      
      if (batchPoints.length > 0) {
        const success = await upsertPoints(batchPoints);
        if (success) {
          console.log(`Added ${batchPoints.length} files to ${COLLECTION_NAME}`);
        } else {
          console.error(`Failed to add batch to ${COLLECTION_NAME}`);
        }
      }
    }
    
    console.log(`\nPropagation Summary:`);
    console.log(`- ${COLLECTION_NAME}: ${successCount}/${totalFiles} files processed successfully`);
    
  } catch (error) {
    console.error('Error populating Qdrant:', error);
  }
} 