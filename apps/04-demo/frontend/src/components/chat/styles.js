// Custom scrollbar styles
export const customScrollbarStyles = {
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '20px',
    '&:hover': {
      background: 'rgba(0, 0, 0, 1)',
    },
  },
  // For Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(0, 0, 0, 0.8) transparent',
}; 