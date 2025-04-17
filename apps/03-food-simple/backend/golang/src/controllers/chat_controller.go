package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smoogie/rag_demo/apps/02-personal-md-files/backend/golang/src/services"
)

// ChatController handles chat-related requests
type ChatController struct {
	llmService      *services.LLMService
	markdownService *services.MarkdownService
}

// NewChatController creates a new ChatController
func NewChatController(llmService *services.LLMService, markdownService *services.MarkdownService) *ChatController {
	return &ChatController{
		llmService:      llmService,
		markdownService: markdownService,
	}
}

// Chat handles chat message requests
func (c *ChatController) Chat(ctx *gin.Context) {
	var request struct {
		Message  string `json:"message" binding:"required"`
		Provider string `json:"provider"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Provider == "" {
		request.Provider = c.llmService.GetDefaultProvider()
	}

	if !c.llmService.IsProviderAvailable(request.Provider) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Provider not available"})
		return
	}

	// Get all markdown files content
	markdownFiles, err := c.markdownService.ReadAllMarkdownFiles()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read markdown files: " + err.Error()})
		return
	}

	// Generate prompt with user message and context
	prompt, err := c.generatePrompt(request.Message, markdownFiles)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate prompt: " + err.Error()})
		return
	}

	// Send the prompt to the LLM service
	response, err := c.llmService.SendMessage(prompt, request.Provider)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate response: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"response": response})
}

// generatePrompt creates a prompt with user message and context from markdown files
func (c *ChatController) generatePrompt(message string, markdownFiles []services.MarkdownFile) (string, error) {
	staticText := `You are a helpful team lead. You are given a question and  information about the team members. Please answer the question based on the information provided.
      You provide answer only based on the information provided in the context.
      You do not generate any information outside of the context.
      If you do not know the answer, just say "I do not know"`

	questionPart := "<question>" + message + "</question>"

	if len(markdownFiles) < 1 {
		return "", fmt.Errorf("EMPTY MARKDOWNS")
	}
	contextPart := "<context>"
	for _, file := range markdownFiles {
		contextPart += "<" + file.Filename + ">"
		contextPart += file.Content
		contextPart += "</" + file.Filename + ">"
	}
	contextPart += "</context>"

	return staticText + "\n\n" + questionPart + "\n\n" + contextPart, nil
}

// Providers returns a map of available providers with their details
func (c *ChatController) Providers() map[string]services.ProviderInfo {
	return c.llmService.GetAvailableProviders()
}

// SwitchProvider changes the current LLM provider
func (c *ChatController) SwitchProvider(ctx *gin.Context) {
	var request struct {
		Provider string `json:"provider" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !c.llmService.IsProviderAvailable(request.Provider) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Provider not available"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Provider switched successfully"})
}
