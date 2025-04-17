import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MarkdownService {
  constructor() {
    this.dataDir = '/data';
  }

  async readAllMarkdownFiles() {
    try {
      const files = await fs.readdir(this.dataDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      const contents = await Promise.all(
        markdownFiles.map(async (file) => {
          const filePath = join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          return {
            filename: file,
            content
          };
        })
      );

      return contents;
    } catch (error) {
      console.error('Error reading markdown files:', error);
      throw error;
    }
  }
}

export const markdownService = new MarkdownService(); 