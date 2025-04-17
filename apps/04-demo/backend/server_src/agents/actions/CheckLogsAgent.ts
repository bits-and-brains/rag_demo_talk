import { Agent } from '../Agent';
import { ActionDataItem } from '../AgentManager';
import { LogRepository } from '../../../databses/repositories/LogRepository';
import { Log, LogSeverity } from '../../../databses/models/Log';
import { GeminiProvider } from '../../llm/gemini/GeminiProvider';
import { PromptTemplateService } from '../../chat/PromptTemplateService';
import * as dotenv from 'dotenv';

dotenv.config();

export class CheckLogsAgent extends Agent {
    private logRepository: LogRepository;
    private geminiProvider: GeminiProvider;
    private promptTemplateService: PromptTemplateService;
    private logs: Log[] = [];
    private response: string = '';
    private error: string | null = null;

    constructor() {
        super();
        this.logRepository = new LogRepository();
        this.geminiProvider = new GeminiProvider();
        this.promptTemplateService = PromptTemplateService.getInstance();
    }

    async execute(data?: ActionDataItem[]): Promise<void> {
        console.log('Checking logs...');
        
        if (!data || data.length === 0) {
            console.log('No data provided for log checking');
            return;
        }

        try {
            // Extract the user message from the data
            const userMessage = this.extractUserMessage(data);
            if (!userMessage) {
                console.log('No message found in data');
                return;
            }

            // Step 1: Ask AI to define filter fields based on the user message
            const filterParams = await this.defineLogFilters(userMessage);
            
            // Step 2: Validate and prepare parameters for LogRepository
            const validatedParams = this.validateAndPrepareParams(filterParams);
            
            // Step 3: Get logs from the repository
            this.logs = await this.fetchLogs(validatedParams);
            
            // Step 4: Generate a response using Gemini
            this.response = await this.generateResponse(userMessage, this.logs);
            
            // Send the response back to the user
            this.sendResponse(this.response);
        } catch (error) {
            console.error('Error checking logs:', error);
            this.error = error instanceof Error ? error.message : 'Unknown error occurred';
            this.response = "I encountered an error while checking the logs.";
            
            // Send the error response back to the user
            this.sendResponse(this.response);
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
        console.log('User message for log checking:', userMessage);
        return userMessage;
    }

    /**
     * Define log filters based on the user message using AI
     * @param userMessage The user's message
     * @returns Object containing filter parameters
     */
    private async defineLogFilters(userMessage: string): Promise<any> {
        try {
            // Create a system prompt for the AI to define log filters
            const systemPrompt = `
You are a log analysis assistant. Your task is to analyze the user's question and determine which log fields should be used for filtering.
Available fields for filtering are:
- severity: Can be "info", "warning", "error", or "debug"
- logger: The name of the logger
- created_at: Timestamp of when the log was created

For each field, determine if it should be used as a filter and what values to use:
- For severity: List which severities to include or exclude
- For logger: Specify the logger name to filter by
- For created_at: Specify if it should be before, after, or within a range of dates

IMPORTANT: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.
The JSON must follow this exact structure:
{
  "filters": {
    "severity": {
      "use": true/false,
      "include": ["info", "warning", "error", "debug"],
      "exclude": ["info", "warning", "error", "debug"]
    },
    "logger": {
      "use": true/false,
      "value": "logger_name"
    },
    "created_at": {
      "use": true/false,
      "before": "YYYY-MM-DD HH:MM:SS",
      "after": "YYYY-MM-DD HH:MM:SS",
      "range": {
        "start": "YYYY-MM-DD HH:MM:SS",
        "end": "YYYY-MM-DD HH:MM:SS"
      }
    }
  }
}

Only include fields that should be used as filters. If a field should not be used, set "use" to false.
`;

            // Use Gemini to generate the filter parameters
            const response = await this.geminiProvider.getCompletion([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ], {
                model: process.env.GEMINI_MODEL || "gemini-pro",
                temperature: 0.2,
                maxTokens: 1000
            });

            console.log(response);
            // Parse the JSON response
            const responseJson = response.replace(/```json\n?|\n?```/g, '').trim();
            const filterParams = JSON.parse(responseJson);
            console.log('Generated filter parameters:', filterParams);
            return filterParams;
        } catch (error) {
            console.error('Error defining log filters:', error);
            throw new Error('Failed to define log filters');
        }
    }

    /**
     * Validate and prepare parameters for LogRepository
     * @param filterParams Filter parameters from AI
     * @returns Validated parameters for LogRepository
     */
    private validateAndPrepareParams(filterParams: any): any {
        const validatedParams: any = {
            page: 1,
            pageSize: 100, // Default page size
            filters: {}
        };

        // Validate severity filters
        if (filterParams.filters?.severity?.use) {
            const severityFilters = filterParams.filters.severity;
            
            // Validate include severities
            if (severityFilters.include && Array.isArray(severityFilters.include)) {
                const validSeverities = severityFilters.include.filter((s: string) => 
                    ['info', 'warning', 'error', 'debug'].includes(s)
                );
                
                if (validSeverities.length > 0) {
                    validatedParams.filters.severity = {
                        include: validSeverities
                    };
                }
            }
            
            // Validate exclude severities
            if (severityFilters.exclude && Array.isArray(severityFilters.exclude)) {
                const validSeverities = severityFilters.exclude.filter((s: string) => 
                    ['info', 'warning', 'error', 'debug'].includes(s)
                );
                
                if (validSeverities.length > 0) {
                    validatedParams.filters.severity = {
                        ...validatedParams.filters.severity,
                        exclude: validSeverities
                    };
                }
            }
        }

        // Validate logger filter
        if (filterParams.filters?.logger?.use && filterParams.filters.logger.value) {
            // Sanitize logger name to prevent SQL injection
            const loggerName = String(filterParams.filters.logger.value).replace(/[;'"\\]/g, '');
            validatedParams.filters.logger = loggerName;
        }

        // Validate created_at filter
        if (filterParams.filters?.created_at?.use) {
            const dateFilters = filterParams.filters.created_at;
            
            // Validate date format (YYYY-MM-DD HH:MM:SS)
            const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            
            if (dateFilters.before && dateRegex.test(dateFilters.before)) {
                validatedParams.filters.created_at = {
                    ...validatedParams.filters.created_at,
                    before: dateFilters.before
                };
            }
            
            if (dateFilters.after && dateRegex.test(dateFilters.after)) {
                validatedParams.filters.created_at = {
                    ...validatedParams.filters.created_at,
                    after: dateFilters.after
                };
            }
            
            if (dateFilters.range && 
                dateRegex.test(dateFilters.range.start) && 
                dateRegex.test(dateFilters.range.end)) {
                validatedParams.filters.created_at = {
                    ...validatedParams.filters.created_at,
                    range: {
                        start: dateFilters.range.start,
                        end: dateFilters.range.end
                    }
                };
            }
        }

        console.log('Validated parameters:', validatedParams);
        return validatedParams;
    }

    /**
     * Fetch logs from the repository based on the validated parameters
     * @param params Validated parameters for LogRepository
     * @returns Array of logs
     */
    private async fetchLogs(params: any): Promise<Log[]> {
        try {
            // Get logs from the repository using findFiltered method
            const result = await this.logRepository.findFiltered(params);
            console.log(`Found ${result.items.length} logs`);
            return result.items;
        } catch (error) {
            console.error('Error fetching logs:', error);
            throw new Error('Failed to fetch logs from the repository');
        }
    }

    /**
     * Generate a response using Gemini based on the user message and logs
     * @param userMessage The user's message
     * @param logs Array of logs
     * @returns A response generated by Gemini
     */
    private async generateResponse(userMessage: string, logs: Log[]): Promise<string> {
        try {
            // Convert logs to a string representation
            const logsString = JSON.stringify(logs, null, 2);
            
            // Create a system prompt for the AI to analyze logs
            const systemPrompt = `
You are a log analysis assistant. Your task is to analyze the provided logs and answer the user's question.
The logs are provided in JSON format. Each log entry contains:
- id: The log ID
- content: The log message
- logger: The name of the logger
- severity: The log severity (info, warning, error, or debug)
- created_at: The timestamp when the log was created

Analyze the logs and provide a helpful, concise answer to the user's question.
If there are no logs that match the criteria, inform the user.
If there are errors or issues in the logs, highlight them.

IMPORTANT: Provide a clear, concise, and helpful response. Focus on answering the user's question directly.
`;

            // Use Gemini to generate the response
            const response = await this.geminiProvider.getCompletion([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `User question: ${userMessage}\n\nLogs:\n${logsString}` }
            ], {
                model: process.env.GEMINI_MODEL || "gemini-pro",
                temperature: 0.7,
                maxTokens: 1000
            });
            
            console.log('Generated response using Gemini');
            return response;
        } catch (error) {
            console.error('Error generating response with Gemini:', error);
            return "I encountered an error while analyzing the logs.";
        }
    }

    /**
     * Get the logs
     * @returns The logs
     */
    public getLogs(): Log[] {
        return this.logs;
    }

    /**
     * Get the generated response
     * @returns The generated response
     */
    public getResponse(): string {
        return this.response;
    }
} 