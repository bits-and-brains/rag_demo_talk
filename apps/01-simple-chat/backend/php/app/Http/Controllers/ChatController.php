<?php

namespace App\Http\Controllers;

use App\Services\LLMService;

class ChatController
{
    protected $llmService;

    public function __construct(LLMService $llmService)
    {
        $this->llmService = $llmService;
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
            $response = $this->llmService->sendMessage($message, $provider);
            return ['response' => $response];
        } catch (\Exception $e) {
            throw new \Exception('Failed to generate response: ' . $e->getMessage());
        }
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