<?php

namespace App\Services\LLM;

use OpenAI\Client;
use OpenAI\Factory;

class OpenAIService implements LLMInterface
{
    private string $apiKey;
    private string $model;
    private Client $client;

    public function __construct()
    {
        $this->apiKey = getenv('OPENAI_API_KEY');
        $this->model = getenv('OPENAI_MODEL') ?: 'gpt-3.5-turbo';

        if (empty($this->apiKey)) {
            throw new \Exception('OpenAI API key is not configured');
        }

        $this->client = (new Factory())
            ->withApiKey($this->apiKey)
            ->make();
    }

    /**
     * Send a message to the OpenAI API and get a response
     *
     * @param string $message The message to send
     * @return string The response from the API
     * @throws \Exception If there is an error communicating with the API
     */
    public function sendMessage(string $message): string
    {
        try {
            $response = $this->client->chat()->create([
                'model' => $this->model,
                'messages' => [
                    ['role' => 'user', 'content' => $message]
                ],
                'temperature' => 0.7,
                'max_tokens' => 1000
            ]);

            return $response->choices[0]->message->content;
        } catch (\Exception $e) {
            throw new \Exception('Error communicating with OpenAI API: ' . $e->getMessage());
        }
    }

    /**
     * Get the name of the LLM provider
     *
     * @return string The name of the provider
     */
    public function getProvider(): string
    {
        return 'OpenAI';
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