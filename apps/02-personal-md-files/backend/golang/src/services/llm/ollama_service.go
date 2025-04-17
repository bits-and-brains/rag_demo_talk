package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// OllamaService implements the LLMInterface for Ollama
type OllamaService struct {
	baseURL string
	model   string
	client  *http.Client
}

// NewOllamaService creates a new OllamaService
func NewOllamaService() (*OllamaService, error) {
	baseURL := os.Getenv("OLLAMA_HOST")
	if baseURL == "" {
		baseURL = "http://localhost:11434"
	}

	model := os.Getenv("OLLAMA_MODEL")
	if model == "" {
		model = "llama2"
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	return &OllamaService{
		baseURL: baseURL,
		model:   model,
		client:  client,
	}, nil
}

// SendMessage sends a message to the Ollama API and returns the response
func (s *OllamaService) SendMessage(message string) (string, error) {
	requestBody := map[string]interface{}{
		"model":  s.model,
		"prompt": message,
		"stream": false,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/generate", s.baseURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request to Ollama API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama API error (status %d): %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	response, ok := result["response"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response format from Ollama API")
	}

	return response, nil
}

// GetProvider returns the name of the LLM provider
func (s *OllamaService) GetProvider() string {
	return "Ollama (Local)"
}

// GetModel returns the model name used by the LLM provider
func (s *OllamaService) GetModel() string {
	return s.model
} 