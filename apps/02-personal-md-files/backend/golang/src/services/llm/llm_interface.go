package llm

// LLMInterface defines the interface that all LLM providers must implement
type LLMInterface interface {
	// SendMessage sends a message to the LLM provider and returns the response
	SendMessage(message string) (string, error)
	
	// GetProvider returns the name of the LLM provider
	GetProvider() string
	
	// GetModel returns the model name used by the LLM provider
	GetModel() string
} 