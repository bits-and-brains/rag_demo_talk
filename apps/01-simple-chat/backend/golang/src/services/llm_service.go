package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

// LLMService handles LLM interactions
type LLMService struct {
	providers map[string]string
}

// NewLLMService creates a new LLMService
func NewLLMService() *LLMService {
	return &LLMService{
		providers: map[string]string{
			"openai": "OpenAI",
			"gemini": "Gemini",
			"ollama": "Ollama",
		},
	}
}

// SendMessage sends a message to the LLM and returns the response
func (s *LLMService) SendMessage(message, provider string) (string, error) {
	switch provider {
	case "openai":
		return s.sendToOpenAI(message)
	case "gemini":
		return s.sendToGemini(message)
	case "ollama":
		return s.sendToOllama(message)
	default:
		return "", fmt.Errorf("unsupported provider: %s", provider)
	}
}

// ProviderInfo represents detailed information about a provider
type ProviderInfo struct {
	Name    string `json:"name"`
	Enabled bool   `json:"enabled"`
	Model   string `json:"model"`
}

// GetAvailableProviders returns a map of available providers with their details
func (s *LLMService) GetAvailableProviders() map[string]ProviderInfo {
	providers := make(map[string]ProviderInfo)

	// Add OpenAI provider
	providers["openai"] = ProviderInfo{
		Name:    "OpenAI",
		Enabled: s.IsProviderAvailable("openai"),
		Model:   os.Getenv("OPENAI_MODEL"),
	}

	// Add Gemini provider
	providers["gemini"] = ProviderInfo{
		Name:    "Google Gemini",
		Enabled: s.IsProviderAvailable("gemini"),
		Model:   os.Getenv("GEMINI_MODEL"),
	}

	// Add Ollama provider
	providers["ollama"] = ProviderInfo{
		Name:    "Ollama (Local)",
		Enabled: s.IsProviderAvailable("ollama"),
		Model:   os.Getenv("OLLAMA_MODEL"),
	}

	return providers
}

// GetDefaultProvider returns the default provider
func (s *LLMService) GetDefaultProvider() string {
	return "openai"
}

// IsProviderAvailable checks if a provider is available
func (s *LLMService) IsProviderAvailable(provider string) bool {
	switch provider {
	case "openai":
		return os.Getenv("OPENAI_API_KEY") != ""
	case "gemini":
		return os.Getenv("GEMINI_API_KEY") != ""
	case "ollama":
		return true
	default:
		return false
	}
}

// sendToOpenAI sends a message to OpenAI
func (s *LLMService) sendToOpenAI(message string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OpenAI API key not found")
	}

	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	url := "https://api.openai.com/v1/chat/completions"
	payload := map[string]interface{}{
		"model": model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": message,
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OpenAI API returned status code %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	choices, ok := result["choices"].([]interface{})
	if !ok || len(choices) == 0 {
		return "", fmt.Errorf("invalid response format")
	}

	choice, ok := choices[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid choice format")
	}

	messageObj, ok := choice["message"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid message format")
	}

	content, ok := messageObj["content"].(string)
	if !ok {
		return "", fmt.Errorf("invalid content format")
	}

	return content, nil
}

// sendToGemini sends a message to Gemini
func (s *LLMService) sendToGemini(message string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("Gemini API key not found")
	}

	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-2.0-flash"
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey)
	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{
						"text": message,
					},
				},
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API returned status code %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("invalid response format")
	}

	candidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid candidate format")
	}

	content, ok := candidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid content format")
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("invalid parts format")
	}

	part, ok := parts[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid part format")
	}

	text, ok := part["text"].(string)
	if !ok {
		return "", fmt.Errorf("invalid text format")
	}

	return text, nil
}

// sendToOllama sends a message to Ollama
func (s *LLMService) sendToOllama(message string) (string, error) {
	ollamaHost := os.Getenv("OLLAMA_HOST")
	if ollamaHost == "" {
		ollamaHost = "http://host.docker.internal:11434"
	}

	model := os.Getenv("OLLAMA_MODEL")
	if model == "" {
		model = "llama2"
	}

	url := fmt.Sprintf("%s/api/generate", ollamaHost)
	payload := map[string]interface{}{
		"model":  model,
		"prompt": message,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Ollama API returned status code %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	response, ok := result["response"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response format")
	}

	return strings.TrimSpace(response), nil
}
