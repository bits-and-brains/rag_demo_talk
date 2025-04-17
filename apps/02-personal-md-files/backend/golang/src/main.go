package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/smoogie/rag_demo/apps/02-personal-md-files/backend/golang/src/controllers"
	"github.com/smoogie/rag_demo/apps/02-personal-md-files/backend/golang/src/services"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	// Initialize services
	llmService := services.NewLLMService()
	markdownService := services.NewMarkdownService()
	chatController := controllers.NewChatController(llmService, markdownService)

	// Create Gin router
	router := gin.Default()

	// Configure CORS
	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3001"
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Split(corsOrigins, ","),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}))

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Personal MD Files Backend",
		})
	})

	// Chat endpoint
	router.POST("/api/chat", chatController.Chat)

	// Providers endpoint
	router.GET("/api/providers", func(c *gin.Context) {
		providers := chatController.Providers()
		c.JSON(http.StatusOK, gin.H{"providers": providers})
	})

	// Switch provider endpoint
	router.POST("/api/switch-provider", chatController.SwitchProvider)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8008"
	}

	log.Printf("Starting server on port %s", port)
	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
