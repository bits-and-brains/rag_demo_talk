import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import { postgresService } from '../services/postgres.js';
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables
dotenv.config();

// Function to check if Ollama is running
async function checkOllama() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11434/api/tags', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
  });
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    return {
      filename: fileName,
      content: content
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

export async function propagateToPostgres(options) {
  try {
    // Check if Ollama is running
    const ollamaRunning = await checkOllama();
    if (!ollamaRunning) {
      throw new Error('Ollama is not running. Please start Ollama first.');
    }

    // Get all recipe files
    const recipesDir = path.join(process.cwd(), '..', 'recipes');
    const files = await fs.readdir(recipesDir);
    const recipeFiles = files.filter(file => file.endsWith('.md'));
    
    if (recipeFiles.length === 0) {
      throw new Error('No recipe files found');
    }
    
    console.log(`Found ${recipeFiles.length} recipe files`);
    
    // Handle schema creation/deletion
    if (options.recreate) {
      console.log('Recreating schema...');
      await postgresService.deleteSchema();
    }
    
    console.log('Creating schema...');
    const schemaCreated = await postgresService.createSchema();
    if (!schemaCreated) {
      throw new Error('Failed to create schema. Please check the PostgreSQL setup and required extensions.');
    }
    
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
          const success = await postgresService.addRecipes(currentBatch);
          if (success) {
            console.log(`Added ${currentBatch.length} files to PostgreSQL`);
            // Add a small delay to allow the vectorizer worker to process
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error(`Failed to add batch to PostgreSQL`);
          }
        }
        currentBatch = [];
      }
    }
    
    console.log(`\nPropagation Summary:`);
    console.log(`- Total files processed: ${successCount}/${totalFiles}`);
    console.log(`- Using Ollama for embeddings with nomic-embed-text model`);
    
    return successCount;
  } catch (error) {
    console.error('Error propagating to PostgreSQL:', error);
    process.exit(1);
  }
}

export function configurePostgresCommand(program) {
  program
    .command('postgres-propagation')
    .description('Store recipe files in PostgreSQL with automated Ollama embeddings')
    .option('-r, --recreate', 'Recreate schema if it already exists', false)
    .option('-b, --batch-size <size>', 'Number of files to process in each batch', '5')
    .action(propagateToPostgres);
} 