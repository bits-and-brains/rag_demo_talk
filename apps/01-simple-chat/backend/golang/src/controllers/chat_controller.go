package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/smoogie/rag_demo/apps/01-simple-chat/backend/golang/src/services"
)

// ChatController handles chat-related requests
type ChatController struct {
	llmService *services.LLMService
}

// NewChatController creates a new ChatController
func NewChatController(llmService *services.LLMService) *ChatController {
	return &ChatController{
		llmService: llmService,
	}
}

// Chat handles chat message requests
func (c *ChatController) Chat(ctx *gin.Context) {
	var request struct {
		Message  string `json:"message" binding:"required"`
		Provider string `json:"provider"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Message is required"})
		return
	}

	if request.Provider == "" {
		request.Provider = c.llmService.GetDefaultProvider()
	}

	if !c.llmService.IsProviderAvailable(request.Provider) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Provider not available"})
		return
	}

	response, err := c.llmService.SendMessage(request.Message, request.Provider)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"response": response})
}

// Providers returns a map of available providers with their details
func (c *ChatController) Providers() map[string]services.ProviderInfo {
	return c.llmService.GetAvailableProviders()
}

// SwitchProvider switches the current LLM provider
func (c *ChatController) SwitchProvider(ctx *gin.Context) {
	var request struct {
		Provider string `json:"provider" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Provider is required"})
		return
	}

	if !c.llmService.IsProviderAvailable(request.Provider) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Provider not available"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Provider switched successfully"})
}
