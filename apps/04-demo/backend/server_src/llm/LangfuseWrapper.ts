import { Langfuse } from 'langfuse';
import { LLMProvider, Message, CompletionOptions, EmbeddingOptions } from './types';
import { TokenizerFactory } from './tokenizers';

export class LangfuseWrapper implements LLMProvider {
    private langfuse: Langfuse;
    private provider: LLMProvider;
    private providerType: string;
    private tokenizer: any;

    constructor(provider: LLMProvider, providerType: string) {
        this.provider = provider;
        this.providerType = providerType;
        this.langfuse = new Langfuse({
            secretKey: process.env.LANGFUSE_SECRET_KEY!,
            publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
            baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
        });
        this.tokenizer = TokenizerFactory.getInstance().getTokenizer(providerType);
    }

    async getCompletion(messages: Message[], options?: CompletionOptions): Promise<string> {
        const trace = this.langfuse.trace({
            name: `${this.providerType}-completion`,
            sessionId: options?.sessionId || undefined
        });

        const modelParameters: Record<string, string | number | boolean | null> = {};
        if (options?.temperature !== undefined) modelParameters.temperature = options.temperature;
        if (options?.maxTokens !== undefined) modelParameters.maxTokens = options.maxTokens;
        if (options?.topP !== undefined) modelParameters.topP = options.topP;
        if (options?.frequencyPenalty !== undefined) modelParameters.frequencyPenalty = options.frequencyPenalty;
        if (options?.presencePenalty !== undefined) modelParameters.presencePenalty = options.presencePenalty;

        // Calculate input tokens
        let inputTokens = 0;
        for (const message of messages) {
            inputTokens += this.tokenizer.countTokens(message.content);
            // Add a small overhead for the role
            inputTokens += this.tokenizer.countTokens(message.role);
        }

        const generation = trace.generation({
            name: 'completion',
            model: options?.model || 'unknown',
            modelParameters: Object.keys(modelParameters).length > 0 ? modelParameters : undefined,
            input: messages,
            usage: {
                input: inputTokens,
                output: 0,
                total: inputTokens
            }
        });

        try {
            const response = await this.provider.getCompletion(messages, options);
            
            // Calculate output tokens
            const outputTokens = this.tokenizer.countTokens(response);
            await generation.update({
                output: response,
                usage: {
                    input: inputTokens,
                    output: outputTokens,
                    total: inputTokens + outputTokens
                }
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
            sessionId: options?.sessionId || undefined
        });

        // Calculate input tokens
        const inputTokens = this.tokenizer.countTokens(text);

        const generation = trace.generation({
            name: 'embedding',
            model: options?.model || 'unknown',
            input: text,
            usage: {
                input: inputTokens,
                output: 0,
                total: inputTokens
            }
        });

        try {
            const response = await this.provider.getEmbedding(text, options);
            const outputTokens = this.tokenizer.countTokens(response);
            await generation.update({
                output: response,
                usage: {
                    input: inputTokens,
                    output: outputTokens,
                    total: inputTokens + outputTokens
                }
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
