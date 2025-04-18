import { Agent } from '../Agent';
import { ActionDataItem } from '../AgentManager';
import { LLMProviderFactory } from '../../llm/LLMProviderFactory';
import { QdrantClient } from '@qdrant/js-client-rest';
import { markdownService } from '../../services/markdownService.js';
import { PromptTemplateService } from '../../chat/PromptTemplateService';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export class GetRecipeAgent extends Agent {
    private llmProvider;
    private embeddingProvider;
    private qdrantClient: QdrantClient;
    private promptTemplateService: PromptTemplateService;
    private readonly COLLECTION_NAME = 'recipes-openai';
    private result: string[] = [];
    private error: string | null = null;
    private recipeContent: string = '';
    private response: string = '';

    constructor() {
        super();
        const factory = LLMProviderFactory.getInstance();
        this.llmProvider = factory.getProvider('gemini');
        this.embeddingProvider = factory.getProvider('openai');
        this.qdrantClient = new QdrantClient({ 
            url: process.env.QDRANT_URL || 'http://localhost:6333' 
        });
        this.promptTemplateService = PromptTemplateService.getInstance();
    }

    async execute(data?: ActionDataItem[]): Promise<void> {
        console.log('Getting recipe...');
        
        if (!data || data.length === 0) {
            console.log('No data provided for recipe search');
            return;
        }
        const sessionId = this.extractSessionId(data);

        try {
            // Extract the user message from the data
            const userMessage = this.extractUserMessage(data);
            if (!userMessage) {
                console.log('No message found in data');
                return;
            }

            // Search for recipes based on the user message
            this.result = await this.searchRecipes(userMessage, sessionId);
            
            // Read the content of the recipe files
            if (this.result.length > 0) {
                this.recipeContent = await this.readRecipeFiles(this.result);
                
                // Generate a response using Gemini
                this.response = await this.generateResponse(userMessage, this.recipeContent, sessionId);
            } else {
                this.response = "I couldn't find any recipes that match your request.";
            }
            
            // Send the response back to the user
            this.sendResponse(this.response, sessionId);
        } catch (error) {
            console.error('Error searching for recipes:', error);
            this.error = error instanceof Error ? error.message : 'Unknown error occurred';
            this.response = "I encountered an error while searching for recipes.";
            
            // Send the error response back to the user
            this.sendResponse(this.response, sessionId);
        }
    }

    /**
     * Extract the user message from the data array
     * @param data Array of action data items
     * @returns The user message or null if not found
     */
    private extractUserMessage(data: ActionDataItem[]): string | null {
        const messageItem = data.find(item => item.name === 'message');
        if (!messageItem) {
            return null;
        }

        const userMessage = String(messageItem.value);
        console.log('User message for recipe search:', userMessage);
        return userMessage;
    }
    private extractSessionId(data: ActionDataItem[]): string {
        const sessionIdItem = data.find(item => item.name === 'session_id');
        if (!sessionIdItem) {
            return uuidv4();
        }
        return String(sessionIdItem.value);
    }

    /**
     * Search for recipes in Qdrant based on the user message
     * @param userMessage The user's message to search for recipes
     * @returns Array of recipe filenames
     */
    private async searchRecipes(userMessage: string, sessionId: string): Promise<string[]> {
        // Generate embedding for the user message
        const embedding = await this.embeddingProvider.getEmbedding(userMessage, {
            model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
            sessionId: sessionId
        });

        // Search for similar recipes in Qdrant
        const searchResult = await this.qdrantClient.search(this.COLLECTION_NAME, {
            vector: embedding,
            limit: 5
        });

        // Extract filenames from search results
        const recipeFiles = searchResult.map(result => {
            const filename = result.payload?.filename;
            return filename ? String(filename) : '';
        }).filter(filename => filename !== '');
        
        console.log('Found recipe files:', recipeFiles);
        
        return recipeFiles;
    }

    /**
     * Read the content of recipe files and create a string based on their content
     * @param filenames Array of recipe filenames
     * @returns A string containing the content of all recipe files
     */
    private async readRecipeFiles(filenames: string[]): Promise<string> {
        try {
            // Add "recipes/" prefix to each filename
            const recipePaths = filenames.map(filename => `recipes/${filename}`);
            
            // Read the content of the recipe files
            const recipeContents = await markdownService.readMarkdownFilesByNames(recipePaths);
            
            if (recipeContents.length === 0) {
                console.log('No recipe content found');
                return '';
            }
            
            // Create a string based on the content of the recipe files
            const combinedContent = recipeContents.map(recipe => {
                return `Recipe: ${recipe.filename}\n\n${recipe.content}\n\n---\n\n`;
            }).join('');
            
            console.log(`Successfully read ${recipeContents.length} recipe files`);
            return combinedContent;
        } catch (error) {
            console.error('Error reading recipe files:', error);
            return '';
        }
    }

    /**
     * Generate a response using Gemini based on the user message and recipe content
     * @param userMessage The user's message
     * @param recipeContent The content of the recipe files
     * @returns A response generated by Gemini
     */
    private async generateResponse(userMessage: string, recipeContent: string, sessionId: string): Promise<string> {
        try {
            // Get the compiled prompt from Langfuse using PromptTemplateService
            const compiledPrompt = await this.promptTemplateService.getCompiledPrompt(
                "agent recipes final",
                [
                    { name: "message", value: userMessage },
                    { name: "context", value: recipeContent }
                ]
            );
            
            // Use the compiled prompt with Gemini
            const response = await this.llmProvider.getCompletion([
                { role: 'user', content: compiledPrompt }
            ], {
                model: process.env.GEMINI_MODEL || "gemini-pro",
                temperature: 0.7,
                maxTokens: 1000,
                sessionId: sessionId
            });
            
            console.log('Generated response using Gemini with Langfuse prompt template');
            return response;
        } catch (error) {
            console.error('Error generating response with Gemini:', error);
            return "I encountered an error while generating a response.";
        }
    }

    /**
     * Get the recipe content
     * @returns The recipe content
     */
    public getRecipeContent(): string {
        return this.recipeContent;
    }

    /**
     * Get the generated response
     * @returns The generated response
     */
    public getResponse(): string {
        return this.response;
    }
} 