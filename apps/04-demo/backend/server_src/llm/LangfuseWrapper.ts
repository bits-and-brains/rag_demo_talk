import { Langfuse } from 'langfuse';
import { LLMProvider, Message, CompletionOptions, EmbeddingOptions } from './types';

export class LangfuseWrapper implements LLMProvider {
    private langfuse: Langfuse;
    private provider: LLMProvider;
    private providerType: string;

    constructor(provider: LLMProvider, providerType: string) {
        this.provider = provider;
        this.providerType = providerType;
        this.langfuse = new Langfuse({
            secretKey: process.env.LANGFUSE_SECRET_KEY!,
            publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
            baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
        });
    }

    async getCompletion(messages: Message[], options?: CompletionOptions): Promise<string> {
        const trace = this.langfuse.trace({
            name: `${this.providerType}-completion`,
        });

        const modelParameters: Record<string, string | number | boolean | null> = {};
        if (options?.temperature !== undefined) modelParameters.temperature = options.temperature;
        if (options?.maxTokens !== undefined) modelParameters.maxTokens = options.maxTokens;
        if (options?.topP !== undefined) modelParameters.topP = options.topP;
        if (options?.frequencyPenalty !== undefined) modelParameters.frequencyPenalty = options.frequencyPenalty;
        if (options?.presencePenalty !== undefined) modelParameters.presencePenalty = options.presencePenalty;

        const generation = trace.generation({
            name: 'completion',
            model: options?.model || 'unknown',
            modelParameters: Object.keys(modelParameters).length > 0 ? modelParameters : undefined,
            input: messages,
        });

        try {
            const response = await this.provider.getCompletion(messages, options);
            await generation.update({
                output: response,
            });
            await trace.update({});
            return response;
        } catch (error) {
            await generation.update({
                statusMessage: error instanceof Error ? error.message : 'Unknown error',
            });
            await trace.update({});
            throw error;
        }
    }

    async getEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
        const trace = this.langfuse.trace({
            name: `${this.providerType}-embedding`,
        });

        const generation = trace.generation({
            name: 'embedding',
            model: options?.model || 'unknown',
            input: text,
        });

        try {
            const response = await this.provider.getEmbedding(text, options);
            await generation.update({
                output: response,
            });
            await trace.update({});
            return response;
        } catch (error) {
            await generation.update({
                statusMessage: error instanceof Error ? error.message : 'Unknown error',
            });
            await trace.update({});
            throw error;
        }
    }
} 