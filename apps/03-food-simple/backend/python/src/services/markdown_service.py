import os
import glob
from typing import List, Dict, Any

class MarkdownService:
    def __init__(self):
        # Get the absolute path to the data directory
        self.data_dir = '/data'
    
    def read_all_markdown_files(self):
        """
        Read all markdown files from the data directory
        
        Returns:
            List[Dict[str, Any]]: An array of markdown files with their content
        """
        try:
            # Find all .md files in the data directory
            markdown_files = glob.glob(os.path.join(self.data_dir, '*.md'))
            contents = []
            for file_path in markdown_files:
                filename = os.path.basename(file_path)
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    contents.append({
                        'filename': filename,
                        'content': content
                    })
            
            return contents
        except Exception as e:
            print(f"Error reading markdown files: {str(e)}")
            raise 
            
    async def read_markdown_files_by_names(self, filenames: List[str]) -> List[Dict[str, Any]]:
        """
        Read markdown files by their filenames
        
        Args:
            filenames: List of filenames to read
            
        Returns:
            List[Dict[str, Any]]: An array of markdown files with their content
        """
        try:
            contents = []
            for filename in filenames:
                file_path = os.path.join(self.data_dir, filename)
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as file:
                        content = file.read()
                        contents.append({
                            'filename': filename,
                            'content': content
                        })
            
            return contents
        except Exception as e:
            print(f"Error reading markdown files by names: {str(e)}")
            raise 