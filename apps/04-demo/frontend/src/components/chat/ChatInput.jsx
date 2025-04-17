import { Box, TextField, Button, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

const ChatInput = ({ 
  message, 
  setMessage, 
  handleSubmit, 
  handleKeyDown, 
  loading, 
  textFieldRef,
  onClearHistory
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'flex-start',
        backgroundColor: '#f5f5f5',
        p: 1,
        borderTop: '1px solid rgba(0, 0, 0, 0.12)'
      }}
    >
      <Tooltip title="Clear History">
        <IconButton 
          onClick={onClearHistory}
          sx={{ 
            alignSelf: 'center',
            backgroundColor: 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'error.dark',
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ flex: 1 }}>
        <TextField
          inputRef={textFieldRef}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          variant="outlined"
          disabled={loading}
          multiline
          maxRows={4}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: 'background.paper',
            }
          }}
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        endIcon={<SendIcon />}
        disabled={loading || !message.trim()}
        onClick={handleSubmit}
        sx={{ 
          height: '56px',
          borderRadius: '20px',
          px: 3,
          alignSelf: 'flex-end'
        }}
      >
        Send
      </Button>
    </Box>
  );
};

export default ChatInput; 