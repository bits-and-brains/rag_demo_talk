import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useEffect } from 'react';
import Chat from './components/Chat';
import Logs from './components/Logs';
import websocketService from './utils/websocket';

function App() {
  useEffect(() => {
    // Initialize WebSocket connection when the app starts
    // This will only connect if not already connected
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              RAG Demo
            </Typography>
            <Link to="/" style={{ color: 'white', marginRight: 20, textDecoration: 'none' }}>
              Chat
            </Link>
            <Link to="/logs" style={{ color: 'white', textDecoration: 'none' }}>
              Logs
            </Link>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App; 