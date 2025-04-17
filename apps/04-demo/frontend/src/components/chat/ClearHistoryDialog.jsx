import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

// Confirmation Dialog Component
const ClearHistoryDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Clear Chat History</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to clear the entire chat history? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete History
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearHistoryDialog; 