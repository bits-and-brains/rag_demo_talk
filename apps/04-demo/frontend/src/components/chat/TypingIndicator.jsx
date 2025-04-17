import { Box, keyframes } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Typing indicator animation
const bounceAnimation = keyframes`
  0%, 80%, 100% { 
    transform: translateY(0);
  }
  40% { 
    transform: translateY(-10px);
  }
`;

// Typing indicator component
const TypingIndicator = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 1
      }}
    >
      <SmartToyIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          backgroundColor: '#e3f2fd',
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              animation: `${bounceAnimation} 1.4s infinite ease-in-out`,
              animationDelay: '0s'
            }} 
          />
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              animation: `${bounceAnimation} 1.4s infinite ease-in-out`,
              animationDelay: '0.2s'
            }} 
          />
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              animation: `${bounceAnimation} 1.4s infinite ease-in-out`,
              animationDelay: '0.4s'
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TypingIndicator; 