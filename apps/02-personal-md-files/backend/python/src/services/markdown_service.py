import os
import glob
from typing import List, Dict, Any

class MarkdownService:
    def __init__(self):
        # Get the absolute path to the data directory
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.data_dir = os.path.join(current_dir, '/data')
    
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