package services

import (
	"os"
	"path/filepath"
	"strings"
)

// MarkdownFile represents a markdown file with its content
type MarkdownFile struct {
	Filename string `json:"filename"`
	Content  string `json:"content"`
}

// MarkdownService handles operations related to markdown files
type MarkdownService struct {
	dataDir string
}

// NewMarkdownService creates a new instance of MarkdownService
func NewMarkdownService() *MarkdownService {
	// Navigate to the data directory
	dataDir := "/data"

	return &MarkdownService{
		dataDir: dataDir,
	}
}

// ReadAllMarkdownFiles reads all markdown files from the data directory
func (s *MarkdownService) ReadAllMarkdownFiles() ([]MarkdownFile, error) {
	var files []MarkdownFile

	// Read all files in the data directory
	entries, err := os.ReadDir(s.dataDir)
	if err != nil {
		return nil, err
	}

	// Filter for .md files and read their content
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".md") {
			filePath := filepath.Join(s.dataDir, entry.Name())
			content, err := os.ReadFile(filePath)
			if err != nil {
				return nil, err
			}

			files = append(files, MarkdownFile{
				Filename: entry.Name(),
				Content:  string(content),
			})
		}
	}

	return files, nil
}
