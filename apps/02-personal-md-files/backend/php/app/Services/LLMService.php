<?php

namespace App\Services;

use App\Services\LLM\LLMInterface;
use App\Services\LLM\GeminiService;
use App\Services\LLM\OpenAIService;
use App\Services\LLM\OllamaService;

class LLMService
{
    private array $providers = [];
    private string $defaultProvider;
    private array $providerNames = [
        'openai' => 'OpenAI',
        'gemini' => 'Google Gemini',
        'ollama' => 'Ollama (Local)'
    ];

    public function __construct()
    {
        $this->defaultProvider = getenv('DEFAULT_LLM_PROVIDER') ?: 'ollama';
        $this->initializeProviders();
    }

    /**
     * Initialize available LLM providers
     */
    private function initializeProviders(): void
    {
        // Initialize OpenAI provider if API key is configured
        if (!empty(getenv('OPENAI_API_KEY'))) {
            try {
                $this->providers['openai'] = new OpenAIService();
            } catch (\Exception $e) {
                // Provider initialization failed
            }
        }

        // Initialize Gemini provider if API key is configured
        if (!empty(getenv('GEMINI_API_KEY'))) {
            try {
                $this->providers['gemini'] = new GeminiService();
            } catch (\Exception $e) {
                // Provider initialization failed
            }
        }

        // Initialize Ollama provider
        try {
            $this->providers['ollama'] = new OllamaService();
        } catch (\Exception $e) {
            // Provider initialization failed
        }
    }

    /**
     * Send a message to the specified LLM provider
     *
     * @param string $message The message to send
     * @param string|null $provider The provider to use (optional)
     * @return string The response from the LLM
     * @throws \Exception If the provider is not available or there is an error
     */
    public function sendMessage(string $message, ?string $provider = null): string
    {
        $provider = $provider ?? $this->defaultProvider;

        if (!isset($this->providers[$provider])) {
            throw new \Exception("LLM provider '{$provider}' is not available");
        }

        try {
            return $this->providers[$provider]->sendMessage($message);
        } catch (\Exception $e) {
            throw new \Exception("Failed to generate response: {$e->getMessage()}");
        }
    }

    /**
     * Get the list of available providers with their details
     *
     * @return array List of available providers with their details
     */
    public function getAvailableProviders(): array
    {
        $result = [];
        foreach ($this->providerNames as $id => $name) {
            $enabled = isset($this->providers[$id]);
            $result[$id] = [
                'name' => $name,
                'enabled' => $enabled,
                'model' => $enabled ? $this->providers[$id]->getModel() : null
            ];
        }
        return $result;
    }

    /**
     * Check if a provider is available
     *
     * @param string $provider The provider to check
     * @return bool Whether the provider is available
     */
    public function isProviderAvailable(string $provider): bool
    {
        return isset($this->providers[$provider]);
    }

    /**
     * Get the default provider
     *
     * @return string The default provider name
     */
    public function getDefaultProvider(): string
    {
        return $this->defaultProvider;
    }
} 