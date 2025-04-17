<?php

namespace App\Services\LLM;

use App\Services\LLM\LLMInterface;
use App\Facades\Http;

class GeminiService implements LLMInterface
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {  
        $this->apiKey = getenv('GEMINI_API_KEY');
        if (empty($this->apiKey)) {
            throw new \Exception('Gemini API key is not configured');
        }

        $this->model = 'gemini-2.0-flash';
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' . $this->model . ':generateContent';
    }

    /**
     * Send a message to the Gemini API and get a response
     *
     * @param string $message The message to send
     * @return string The response from the API
     * @throws \Exception If there is an error communicating with the API
     */
    public function sendMessage(string $message): string
    {
        try {
            // Make sure the API key is properly set
            if (empty($this->apiKey)) {
                throw new \Exception('Gemini API key is not configured');
            }

            // Construct the request URL with the API key
            $url = $this->baseUrl . '?key=' . $this->apiKey;
            
            // Prepare the request payload
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $message]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ];
            
            // Make the API request
            $response = Http::post($url, [
                'json' => $payload,
                'headers' => [
                    'Content-Type' => 'application/json'
                ]
            ]);
            
            // Check if the response is valid
            if (!is_array($response)) {
                throw new \Exception('Invalid response from Gemini API: ' . json_encode($response));
            }
            
            if (isset($response['error'])) {
                throw new \Exception('Gemini API error: ' . json_encode($response['error']));
            }
            
            if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
                throw new \Exception('Invalid response format from Gemini API: ' . json_encode($response));
            }

            return $response['candidates'][0]['content']['parts'][0]['text'];
        } catch (\Exception $e) {
            throw new \Exception('Error communicating with Gemini API: ' . $e->getMessage());
        }
    }

    /**
     * Get the name of the LLM provider
     *
     * @return string The name of the provider
     */
    public function getProvider(): string
    {
        return 'Google Gemini';
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