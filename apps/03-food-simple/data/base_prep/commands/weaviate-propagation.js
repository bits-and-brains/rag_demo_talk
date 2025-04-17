import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import { weaviateService } from '../services/weaviate.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

export async function propagateToWeaviate(options) {
  try {
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
      await weaviateService.deleteSchema();
    }
    
    await weaviateService.createSchema();
    
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
          const success = await weaviateService.addRecipes(currentBatch);
          if (success) {
            console.log(`Added ${currentBatch.length} files to Weaviate`);
          } else {
            console.error(`Failed to add batch to Weaviate`);
          }
        }
        currentBatch = [];
      }
    }
    
    console.log(`\nPropagation Summary:`);
    console.log(`- Total files processed: ${successCount}/${totalFiles}`);
    
    return successCount;
  } catch (error) {
    console.error('Error propagating to Weaviate:', error);
    process.exit(1);
  }
}

export function configureWeaviateCommand(program) {
  program
    .command('weaviate-propagation')
    .description('Store recipe files in Weaviate with OpenAI embeddings')
    .option('-r, --recreate', 'Recreate schema if it already exists', false)
    .option('-b, --batch-size <size>', 'Number of files to process in each batch', '5')
    .action(propagateToWeaviate);
} 