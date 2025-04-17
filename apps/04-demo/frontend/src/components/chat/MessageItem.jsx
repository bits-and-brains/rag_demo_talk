import { Box } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MarkdownMessage from './MarkdownMessage';

const MessageItem = ({ message }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        flexDirection: message.author === 'user' ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1
      }}
    >
      {message.author === 'assistant' ? (
        <SmartToyIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
      ) : (
        <PersonIcon sx={{ fontSize: 40, color: 'success.main', mt: 1 }} />
      )}
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          backgroundColor: message.author === 'user' ? '#e8f5e9' : '#e3f2fd',
          borderRadius: 2,
          boxShadow: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        <MarkdownMessage content={message.content} />
      </Box>
    </Box>
  );
};

export default MessageItem; 