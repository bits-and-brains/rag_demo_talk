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

// OpenAIService implements the LLMInterface for OpenAI
type OpenAIService struct {
	apiKey  string
	model   string
	baseURL string
	client  *http.Client
}

// NewOpenAIService creates a new OpenAIService
func NewOpenAIService() (*OpenAIService, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is not configured")
	}

	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	return &OpenAIService{
		apiKey:  apiKey,
		model:   model,
		baseURL: "https://api.openai.com/v1",
		client:  client,
	}, nil
}

// SendMessage sends a message to the OpenAI API and returns the response
func (s *OpenAIService) SendMessage(message string) (string, error) {
	requestBody := map[string]interface{}{
		"model": s.model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": message,
			},
		},
		"temperature": 0.7,
		"max_tokens":  1000,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/chat/completions", s.baseURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request to OpenAI API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OpenAI API error (status %d): %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	choices, ok := result["choices"].([]interface{})
	if !ok || len(choices) == 0 {
		return "", fmt.Errorf("no response choices returned from OpenAI API")
	}

	choice, ok := choices[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid response format from OpenAI API")
	}

	messageObj, ok := choice["message"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid message format from OpenAI API")
	}

	content, ok := messageObj["content"].(string)
	if !ok {
		return "", fmt.Errorf("invalid content format from OpenAI API")
	}

	return content, nil
}

// GetProvider returns the name of the LLM provider
func (s *OpenAIService) GetProvider() string {
	return "OpenAI"
}

// GetModel returns the model name used by the LLM provider
func (s *OpenAIService) GetModel() string {
	return s.model
} 