import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import { elasticsearchService } from '../services/elasticsearch.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

async function getEmbedding(text) {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const embedding = await getEmbedding(content);
    
    return {
      filename: fileName,
      content: content,
      embedding: embedding
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

export async function propagateToElasticsearch(options) {
  try {
    // Get all recipe files
    const recipesDir = path.join(process.cwd(), '..', 'recipes');
    const files = await fs.readdir(recipesDir);
    const recipeFiles = files.filter(file => file.endsWith('.md'));
    
    if (recipeFiles.length === 0) {
      throw new Error('No recipe files found');
    }
    
    console.log(`Found ${recipeFiles.length} recipe files`);
    
    // Handle index creation/deletion
    if (options.recreate) {
      console.log('Recreating index...');
      await elasticsearchService.deleteIndex();
    }
    
    await elasticsearchService.createIndex();
    
    // Process files in batches
    const batchSize = options.batchSize || 5;
    const totalFiles = recipeFiles.length;
    let processedCount = 0;
    let successCount = 0;
    let currentBatch = [];
    
    for (const file of recipeFiles) {
      processedCount++;
      const filePath = path.join(recipesDir, file);
      console.log(`Processing ${file} (${processedCount}/${totalFiles})...`);
      
      const recipe = await processFile(filePath);
      if (recipe) {
        currentBatch.push(recipe);
        successCount++;
      }
      
      if (currentBatch.length >= batchSize || processedCount === totalFiles) {
        if (currentBatch.length > 0) {
          const success = await elasticsearchService.addRecipes(currentBatch);
          if (success) {
            console.log(`Added ${currentBatch.length} files to Elasticsearch`);
          } else {
            console.error(`Failed to add batch to Elasticsearch`);
          }
        }
        currentBatch = [];
      }
    }
    
    console.log(`\nPropagation Summary:`);
    console.log(`- Total files processed: ${successCount}/${totalFiles}`);
    
    return successCount;
  } catch (error) {
    console.error('Error propagating to Elasticsearch:', error);
    process.exit(1);
  }
}

export function configureElasticsearchCommand(program) {
  program
    .command('elasticsearch-propagation')
    .description('Store recipe files in Elasticsearch with Ollama embeddings')
    .option('-r, --recreate', 'Recreate index if it already exists', false)
    .option('-b, --batch-size <size>', 'Number of files to process in each batch', '5')
    .action(propagateToElasticsearch);
} 