import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MarkdownService {
  constructor() {
    this.dataDir = join(dirname(dirname(dirname(__dirname))), 'backend', 'data_store');
    console.log(`MarkdownService initialized with data directory: ${this.dataDir}`);
  }

  async readMarkdownFilesByNames(filenames) {
    try {
      const contents = await Promise.all(
        filenames.map(async (filename) => {
          const filePath = join(this.dataDir, filename);
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            return {
              filename,
              content
            };
          } catch (error) {
            console.error(`Error reading file ${filename}:`, error);
            return null;
          }
        })
      );

      // Filter out any null values (files that couldn't be read)
      return contents.filter(file => file !== null);
    } catch (error) {
      console.error('Error reading markdown files by names:', error);
      throw error;
    }
  }

  /**
   * Read a single markdown file by name
   * @param {string} filename - The name of the file to read
   * @returns {Promise<{filename: string, content: string} | null>} - The file content or null if not found
   */
  async readMarkdownFile(filename) {
    try {
      const filePath = join(this.dataDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        filename,
        content
      };
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return null;
    }
  }
}

export const markdownService = new MarkdownService(); 