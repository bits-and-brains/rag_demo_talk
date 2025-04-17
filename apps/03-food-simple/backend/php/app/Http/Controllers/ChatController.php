<?php

namespace App\Http\Controllers;

use App\Services\LLMService;
use App\Services\MarkdownService;

class ChatController
{
    protected $llmService;
    protected $markdownService;

    public function __construct(LLMService $llmService, MarkdownService $markdownService)
    {
        $this->llmService = $llmService;
        $this->markdownService = $markdownService;
    }

    /**
     * Handle chat message requests
     *
     * @param array $data Request data containing message and optional provider
     * @return array Response containing the generated message
     * @throws \Exception If message is missing or generation fails
     */
    public function chat($data)
    {
        if (!isset($data['message'])) {
            throw new \Exception('Message is required');
        }

        $message = $data['message'];
        $provider = $data['provider'] ?? 'ollama';

        try {
            // Get all markdown files content
            $markdownFiles = $this->markdownService->readAllMarkdownFiles();
            
            // Generate prompt with user message and context
            $prompt = $this->generatePrompt($message, $markdownFiles);
            
            // Send the prompt to the LLM service
            $response = $this->llmService->sendMessage($prompt, $provider);
            return ['response' => $response];
        } catch (\Exception $e) {
            throw new \Exception('Failed to generate response: ' . $e->getMessage());
        }
    }

    /**
     * Generate a prompt with user message and context from markdown files
     *
     * @param string $message User message
     * @param array $markdownFiles Array of markdown files with their content
     * @return string Generated prompt
     */
    private function generatePrompt(string $message, array $markdownFiles): string
    {
        $staticText = `You are a helpful team lead. You are given a question and  information about the team members. Please answer the question based on the information provided.
      You provide answer only based on the information provided in the context.
      You do not generate any information outside of the context.
      If you do not know the answer, just say "I do not know".`;
        
        $questionPart = "<question>" . $message . "</question>";
        
        $contextPart = "<context>";
        foreach ($markdownFiles as $file) {
            $contextPart .= "<{$file['filename']}>";
            $contextPart .= $file['content'];
            $contextPart .= "</{$file['filename']}>";
        }
        $contextPart .= "</context>";
        
        return $staticText . "\n\n" . $questionPart . "\n\n" . $contextPart;
    }

    /**
     * Get available LLM providers
     *
     * @return array List of available providers
     * @throws \Exception If providers cannot be retrieved
     */
    public function providers()
    {
        try {
            return [
                'providers' => $this->llmService->getAvailableProviders()
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to get providers: ' . $e->getMessage());
        }
    }

    /**
     * Switch the current LLM provider
     *
     * @param array $data Request data containing provider
     * @return array Success message
     * @throws \Exception If provider is missing or not available
     */
    public function switchProvider($data)
    {
        if (!isset($data['provider'])) {
            throw new \Exception('Provider is required');
        }

        $provider = $data['provider'];
        
        if (!$this->llmService->isProviderAvailable($provider)) {
            throw new \Exception('Provider not available');
        }

        return ['message' => 'Provider switched successfully'];
    }
} 