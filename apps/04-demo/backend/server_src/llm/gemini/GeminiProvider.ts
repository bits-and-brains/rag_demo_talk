import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { LLMProvider, Message, CompletionOptions, EmbeddingOptions } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    async getCompletion(messages: Message[], options?: CompletionOptions): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: options?.model || "gemini-pro",
                generationConfig: {
                    temperature: options?.temperature,
                    topP: options?.topP,
                    maxOutputTokens: options?.maxTokens,
                },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                ],
            });

            // Extract system prompt if present
            const systemMessage = messages.find(msg => msg.role === 'system');
            const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
            
            // Start a chat with the system prompt if available
            const chat = model.startChat({
                history: nonSystemMessages.slice(0, -1).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: msg.content,
                })),
            });

            // If there's a system message, send it first
            if (systemMessage) {
                await chat.sendMessage(`System: ${systemMessage.content}`);
            }

            // Send the last message
            const result = await chat.sendMessage(nonSystemMessages[nonSystemMessages.length - 1].content);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error getting completion from Gemini:', error);
            throw new Error('Failed to get completion from Gemini');
        }
    }

    async getEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: options?.model || "embedding-001"
            });

            const result = await model.embedContent(text);
            const embedding = await result.embedding;
            return embedding.values;
        } catch (error) {
            console.error('Error getting embedding from Gemini:', error);
            throw new Error('Failed to get embedding from Gemini');
        }
    }
} 