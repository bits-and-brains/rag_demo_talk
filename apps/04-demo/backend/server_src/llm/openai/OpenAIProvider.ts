import OpenAI from 'openai';
import { LLMProvider, Message, CompletionOptions, EmbeddingOptions } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async getCompletion(messages: Message[], options?: CompletionOptions): Promise<string> {
        try {
            const completion = await this.client.chat.completions.create({
                model: options?.model || "gpt-3.5-turbo",
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
                top_p: options?.topP,
                frequency_penalty: options?.frequencyPenalty,
                presence_penalty: options?.presencePenalty,
            });

            return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
        } catch (error) {
            console.error('Error getting completion from OpenAI:', error);
            throw new Error('Failed to get completion from OpenAI');
        }
    }

    async getEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model: options?.model || "text-embedding-ada-002",
                input: text,
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Error getting embedding from OpenAI:', error);
            throw new Error('Failed to get embedding from OpenAI');
        }
    }
} 