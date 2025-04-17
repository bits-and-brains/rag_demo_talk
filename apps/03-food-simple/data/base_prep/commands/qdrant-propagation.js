import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import { qdrantService } from '../services/qdrant.js';
import { EmbeddingFactory } from '../services/embeddings/embedding-factory.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const COLLECTION_PREFIX = 'recipes';
const EMBEDDING_TYPES = ['openai', 'gemini', 'ollama'];

async function processFile(filePath, embeddingService) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    const vector = await embeddingService.getEmbedding(content);
    
    return {
      id: uuidv4(),
      vector,
      payload: {
        filename: fileName,
        content: content
      }
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

async function processWithEmbeddingService(embeddingType, files, options) {
  console.log(`\nProcessing with ${embeddingType} embeddings...`);
  
  try {
    const embeddingService = EmbeddingFactory.getEmbeddingService(embeddingType);
    const collectionName = `${COLLECTION_PREFIX}-${embeddingType}`;
    
    // Get vector size from the first file
    const firstFile = files[0];
    const firstFilePath = path.join(process.cwd(), '..', 'recipes', firstFile);
    const firstFileContent = await fs.readFile(firstFilePath, 'utf-8');
    const firstVector = await embeddingService.getEmbedding(firstFileContent);
    const VECTOR_SIZE = firstVector.length;
    
    // Handle collection creation/recreation
    if (options.recreate) {
      console.log(`Recreating collection ${collectionName}...`);
      await qdrantService.recreateCollection(collectionName, VECTOR_SIZE);
    } else {
      await qdrantService.createCollection(collectionName, VECTOR_SIZE);
    }
    
    // Process files in batches
    const batchSize = options.batchSize || 5;
    const totalFiles = files.length;
    let processedCount = 0;
    let successCount = 0;
    
    for (let i = 0; i < totalFiles; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPoints = [];
      
      for (const file of batch) {
        processedCount++;
        const filePath = path.join(process.cwd(), '..', 'recipes', file);
        console.log(`Processing ${file} with ${embeddingType} (${processedCount}/${totalFiles})...`);
        
        const point = await processFile(filePath, embeddingService);
        if (point) {
          batchPoints.push(point);
          successCount++;
        }
      }
      
      if (batchPoints.length > 0) {
        const success = await qdrantService.upsertPoints(collectionName, batchPoints);
        if (success) {
          console.log(`Added ${batchPoints.length} files to ${collectionName}`);
        } else {
          console.error(`Failed to add batch to ${collectionName}`);
        }
      }
    }
    
    console.log(`Completed processing with ${embeddingType}: ${successCount}/${totalFiles} files processed successfully`);
    return successCount;
  } catch (error) {
    console.error(`Error processing with ${embeddingType}:`, error);
    return 0;
  }
}

export async function propagateToQdrant(options) {
  try {
    // Get all recipe files
    const recipesDir = path.join(process.cwd(), '..', 'recipes');
    const files = await fs.readdir(recipesDir);
    const recipeFiles = files.filter(file => file.endsWith('.md'));
    
    if (recipeFiles.length === 0) {
      throw new Error('No recipe files found');
    }
    
    console.log(`Found ${recipeFiles.length} recipe files`);
    
    // Determine which embedding types to use
    const embeddingTypes = options.types 
      ? options.types.split(',').map(t => t.trim().toLowerCase())
      : EMBEDDING_TYPES;
    
    // Validate embedding types
    const validTypes = embeddingTypes.filter(type => EMBEDDING_TYPES.includes(type));
    if (validTypes.length === 0) {
      throw new Error('No valid embedding types specified');
    }
    
    console.log(`Using embedding types: ${validTypes.join(', ')}`);
    
    // Process with each embedding service
    const results = {};
    for (const embeddingType of validTypes) {
      const successCount = await processWithEmbeddingService(embeddingType, recipeFiles, options);
      results[embeddingType] = successCount;
    }
    
    // Summary
    console.log('\nPropagation Summary:');
    for (const [type, count] of Object.entries(results)) {
      const collectionName = `${COLLECTION_PREFIX}-${type}`;
      console.log(`- ${collectionName}: ${count}/${recipeFiles.length} files processed successfully`);
    }
    
    return results;
  } catch (error) {
    console.error('Error propagating to Qdrant:', error);
    process.exit(1);
  }
}

export function configureQdrantCommand(program) {
  program
    .command('qdrant-propagation')
    .description('Generate embeddings for recipe files using multiple embedding services and store them in separate Qdrant collections')
    .option('-t, --types <types>', 'Comma-separated list of embedding types to use (openai,gemini,ollama)', 'openai,gemini,ollama')
    .option('-r, --recreate', 'Recreate collections if they already exist', false)
    .option('-b, --batch-size <size>', 'Number of files to process in each batch', '5')
    .action(propagateToQdrant);
} 