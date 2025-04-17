import { Langfuse } from "langfuse";

export interface TemplateVariable {
    name: string;
    value: string | string[];
}

export class PromptTemplateService {
    private static instance: PromptTemplateService;
    private langfuse: Langfuse;

    private constructor() {
        this.langfuse = new Langfuse({
            secretKey: process.env.LANGFUSE_SECRET_KEY!,
            publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
            baseUrl: process.env.LANGFUSE_HOST,
        });
    }

    public static getInstance(): PromptTemplateService {
        if (!PromptTemplateService.instance) {
            PromptTemplateService.instance = new PromptTemplateService();
        }
        return PromptTemplateService.instance;
    }

    async getCompiledPrompt(templateName: string, variables: TemplateVariable[]): Promise<string> {
        try {
            const prompt = await this.langfuse.getPrompt(templateName);
            
            // Convert variables array to object format expected by Langfuse
            const variablesObject = variables.reduce((acc, { name, value }) => {
                acc[name] = Array.isArray(value) ? value.join(', ') : value;
                return acc;
            }, {} as Record<string, string>);

            return prompt.compile(variablesObject);
        } catch (error) {
            console.error(`Error getting compiled prompt for template ${templateName}:`, error);
            throw new Error(`Failed to get compiled prompt for template ${templateName}`);
        }
    }
} 