import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });


// Import controllers after environment variables are loaded
import { chatController } from './controllers/chatController.js';

const app = express();
const port = process.env.PORT || 8006;

app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3001'
}));
app.use(express.json());

// Routes
app.post('/api/chat', chatController.chat);
app.get('/api/providers', chatController.providers);
app.post('/api/switch-provider', chatController.switchProvider);

app.listen(port, () => {
  console.log(`Node.js backend server running on port ${port}`);
}); 