<?php

namespace App\Services;

class MarkdownService
{
    private string $dataDir;

    public function __construct()
    {
        $this->dataDir = '/data';
    }

    /**
     * Read all markdown files from the data directory
     *
     * @return array An array of markdown files with their content
     */
    public function readAllMarkdownFiles(): array
    {
        try {
            $files = scandir($this->dataDir);
            $markdownFiles = array_filter($files, function($file) {
                return pathinfo($file, PATHINFO_EXTENSION) === 'md';
            });

            $contents = [];
            foreach ($markdownFiles as $file) {
                $filePath = $this->dataDir . '/' . $file;
                $content = file_get_contents($filePath);
                
                if ($content !== false) {
                    $contents[] = [
                        'filename' => $file,
                        'content' => $content
                    ];
                }
            }

            return $contents;
        } catch (\Exception $e) {
            error_log('Error reading markdown files: ' . $e->getMessage());
            throw $e;
        }
    }
} 