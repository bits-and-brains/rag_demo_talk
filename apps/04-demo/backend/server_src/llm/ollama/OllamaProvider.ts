import { LLMProvider, Message, CompletionOptions, EmbeddingOptions } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class OllamaProvider implements LLMProvider {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    }

    async getCompletion(messages: Message[], options?: CompletionOptions): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: options?.model || 'llama2',
                    messages: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    options: {
                        temperature: options?.temperature,
                        top_p: options?.topP,
                        num_predict: options?.maxTokens,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            // Ollama returns a stream of JSON objects, one per line
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            let result = '';
            let done = false;
            
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                
                if (value) {
                    // Convert the Uint8Array to a string
                    const chunk = new TextDecoder().decode(value);
                    
                    // Process each line (JSON object) in the chunk
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');
                    
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.message?.content) {
                                result += data.message.content;
                            }
                        } catch (e) {
                            console.warn('Failed to parse JSON line:', line, e);
                        }
                    }
                }
            }
            
            return result || "Sorry, I couldn't generate a response.";
        } catch (error) {
            console.error('Error getting completion from Ollama:', error);
            throw new Error('Failed to get completion from Ollama');
        }
    }

    async getEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: options?.model || 'llama2',
                    prompt: text
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.embedding;
        } catch (error) {
            console.error('Error getting embedding from Ollama:', error);
            throw new Error('Failed to get embedding from Ollama');
        }
    }
} 