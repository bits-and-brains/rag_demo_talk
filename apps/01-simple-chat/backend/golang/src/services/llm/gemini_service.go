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

// GeminiService implements the LLMInterface for Google Gemini
type GeminiService struct {
	apiKey  string
	model   string
	baseURL string
	client  *http.Client
}

// NewGeminiService creates a new GeminiService
func NewGeminiService() (*GeminiService, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key is not configured")
	}

	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-2.0-flash"
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	return &GeminiService{
		apiKey:  apiKey,
		model:   model,
		baseURL: "https://generativelanguage.googleapis.com/v1beta",
		client:  client,
	}, nil
}

// SendMessage sends a message to the Gemini API and returns the response
func (s *GeminiService) SendMessage(message string) (string, error) {
	requestBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{
						"text": message,
					},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.7,
			"topK":           40,
			"topP":           0.95,
			"maxOutputTokens": 1024,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %w", err)
	}

	url := fmt.Sprintf("%s/models/%s:generateContent?key=%s", s.baseURL, s.model, s.apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request to Gemini API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API error (status %d): %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("no candidates returned from Gemini API")
	}

	candidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid candidate format from Gemini API")
	}

	content, ok := candidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid content format from Gemini API")
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("no parts returned from Gemini API")
	}

	part, ok := parts[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid part format from Gemini API")
	}

	text, ok := part["text"].(string)
	if !ok {
		return "", fmt.Errorf("invalid text format from Gemini API")
	}

	return text, nil
}

// GetProvider returns the name of the LLM provider
func (s *GeminiService) GetProvider() string {
	return "Google Gemini"
}

// GetModel returns the model name used by the LLM provider
func (s *GeminiService) GetModel() string {
	return s.model
} 