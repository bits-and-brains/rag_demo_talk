import { useState, useEffect, useRef } from 'react';
import { Box, Paper, Alert, Typography, useTheme, useMediaQuery } from '@mui/material';
import { apiPost, apiGet, apiDelete } from '../utils/api';
import TypingIndicator from './chat/TypingIndicator';
import MessageItem from './chat/MessageItem';
import ChatInput from './chat/ChatInput';
import ClearHistoryDialog from './chat/ClearHistoryDialog';
import { customScrollbarStyles } from './chat/styles';
import websocketService from '../utils/websocket';
import { processMessage } from '../utils/messageHandlers';

function Chat() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textFieldRef = useRef(null);
  const messageIdCounter = useRef(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [isTyping]);

  // Handle WebSocket messages
  useEffect(() => {
    const handleWebSocketMessage = (message) => {
      // Process the message using our message handlers
      processMessage(message, {
        addMessage: (message) => {
          setChatHistory(prevHistory => [...prevHistory, message]);
        },
        setTyping: (typing) => {
          setIsTyping(typing);
        }
      });
    };

    websocketService.addMessageHandler(handleWebSocketMessage);

    return () => {
      websocketService.removeMessageHandler(handleWebSocketMessage);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await apiGet('chat');
      if (response.success) {
        setChatHistory(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleKeyDown = (e) => {
    // Handle message submission
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    
    // Add user message to chat history with unique ID
    const userMessage = { 
      id: `msg_${messageIdCounter.current++}`, 
      content: message, 
      author: 'user', 
      created_at: new Date().toISOString() 
    };
    
    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    setMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const data = await apiPost('chat', { message: userMessage.content });
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Process the response
      if (data.messages && data.messages.length > 0) {
        const assistantMessage = data.messages[0].content;
        setChatHistory(prevHistory => [
          ...prevHistory, 
          { 
            id: `msg_${messageIdCounter.current++}`, 
            content: assistantMessage.content, 
            author: 'assistant', 
            created_at: assistantMessage.created_at 
          }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistoryClick = () => {
    setClearHistoryDialogOpen(true);
  };

  const handleClearHistoryConfirm = async () => {
    try {
      await apiDelete('chat');
      setChatHistory([]);
      setClearHistoryDialogOpen(false);
    } catch (error) {
      console.error('Error clearing history:', error);
      setError('Failed to clear chat history');
    }
  };

  return (
    <Box 
      sx={{ 
        maxWidth: isMobile ? '100%' : 800, 
        width: '100%',
        height: 'calc(100vh - 48px)',
        mx: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        p: 0,
        mt: 0
      }}
    >
      <Paper sx={{ 
        flex: 1, 
        p: 2, 
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 0,
        ...customScrollbarStyles
      }}>
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          mb: 8,
          ...customScrollbarStyles
        }}>
          {chatHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Start a conversation by typing a message below.
              </Typography>
            </Box>
          ) : (
            chatHistory.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))
          )}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 1, position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 1 }}>
            {error}
          </Alert>
        )}
        
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <ChatInput 
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
            handleKeyDown={handleKeyDown}
            loading={loading}
            textFieldRef={textFieldRef}
            onClearHistory={handleClearHistoryClick}
          />
        </Box>
      </Paper>

      <ClearHistoryDialog
        open={clearHistoryDialogOpen}
        onClose={() => setClearHistoryDialogOpen(false)}
        onConfirm={handleClearHistoryConfirm}
      />
    </Box>
  );
}

export default Chat; 