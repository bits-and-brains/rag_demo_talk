import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Markdown component with custom styling
const MarkdownMessage = ({ content }) => {
  // Process the content to ensure newlines are properly handled
  const processedContent = content?.replace(/\\n/g, '\n') || '';
  
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <Typography variant="body1" component="p" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{children}</Typography>,
        h1: ({ children }) => <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 1 }}>{children}</Typography>,
        h2: ({ children }) => <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>{children}</Typography>,
        h3: ({ children }) => <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>{children}</Typography>,
        ul: ({ children }) => <Box component="ul" sx={{ pl: 2, mb: 1 }}>{children}</Box>,
        ol: ({ children }) => <Box component="ol" sx={{ pl: 2, mb: 1 }}>{children}</Box>,
        li: ({ children }) => <Typography component="li" variant="body1">{children}</Typography>,
        code: ({ inline, children }) => (
          inline ? 
            <Box component="code" sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.05)', 
              p: 0.5, 
              borderRadius: 1,
              fontFamily: 'monospace'
            }}>
              {children}
            </Box> : 
            <Box component="pre" sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.05)', 
              p: 1, 
              borderRadius: 1,
              overflow: 'auto',
              mb: 1
            }}>
              <Box component="code" sx={{ fontFamily: 'monospace' }}>{children}</Box>
            </Box>
        ),
        blockquote: ({ children }) => (
          <Box component="blockquote" sx={{ 
            borderLeft: '4px solid #ccc', 
            pl: 2, 
            py: 0.5, 
            my: 1,
            fontStyle: 'italic'
          }}>
            {children}
          </Box>
        ),
        a: ({ href, children }) => (
          <Typography component="a" href={href} sx={{ color: 'primary.main', textDecoration: 'underline' }}>
            {children}
          </Typography>
        ),
        img: ({ src, alt }) => (
          <Box component="img" src={src} alt={alt} sx={{ maxWidth: '100%', height: 'auto', my: 1 }} />
        ),
        table: ({ children }) => (
          <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', mb: 1 }}>
            {children}
          </Box>
        ),
        th: ({ children }) => (
          <Box component="th" sx={{ border: '1px solid #ddd', p: 1, textAlign: 'left' }}>
            {children}
          </Box>
        ),
        td: ({ children }) => (
          <Box component="td" sx={{ border: '1px solid #ddd', p: 1 }}>
            {children}
          </Box>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownMessage; 