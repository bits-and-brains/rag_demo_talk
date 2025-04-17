<?php

namespace App\Services\LLM;

use App\Facades\Http;

class OllamaService implements LLMInterface
{
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->baseUrl = getenv('OLLAMA_HOST') ?: 'http://localhost:11434';
        $this->model = getenv('OLLAMA_MODEL') ?: 'llama2';
    }

    /**
     * Send a message to the Ollama API and get a response
     *
     * @param string $message The message to send
     * @return string The response from the API
     * @throws \Exception If there is an error communicating with the API
     */
    public function sendMessage(string $message): string
    {
        try {
            $response = Http::post($this->baseUrl . '/api/generate', [
                'json' => [
                    'model' => $this->model,
                    'prompt' => $message,
                    'stream' => false
                ]
            ]);
            
            if (!is_array($response)) {
                throw new \Exception('Invalid response from Ollama API: ' . json_encode($response));
            }
            
            if (!isset($response['response'])) {
                throw new \Exception('Invalid response format from Ollama API: ' . json_encode($response));
            }

            return $response['response'];
        } catch (\Exception $e) {
            throw new \Exception('Error communicating with Ollama API: ' . $e->getMessage());
        }
    }

    /**
     * Get the name of the LLM provider
     *
     * @return string The name of the provider
     */
    public function getProvider(): string
    {
        return 'Ollama (Local)';
    }

    /**
     * Get the model name used by the LLM provider
     *
     * @return string The model name
     */
    public function getModel(): string
    {
        return $this->model;
    }
} 