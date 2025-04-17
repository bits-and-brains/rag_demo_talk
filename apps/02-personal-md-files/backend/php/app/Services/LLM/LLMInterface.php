<?php

namespace App\Services\LLM;

interface LLMInterface
{
    /**
     * Send a message to the LLM provider and get a response
     *
     * @param string $message The message to send
     * @return string The response from the LLM
     * @throws \Exception If there is an error communicating with the API
     */
    public function sendMessage(string $message): string;

    /**
     * Get the name of the LLM provider
     *
     * @return string The provider name
     */
    public function getProvider(): string;

    /**
     * Get the model name used by the LLM provider
     *
     * @return string The model name
     */
    public function getModel(): string;
} 