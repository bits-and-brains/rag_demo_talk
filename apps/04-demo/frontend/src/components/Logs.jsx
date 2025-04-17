import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { apiGet } from '../utils/api';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SecurityIcon from '@mui/icons-material/Security';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const getLoggerIcon = (logger) => {
  switch (logger) {
    case 'ai':
      return <SmartToyIcon />;
    case 'process':
      return <SettingsIcon />;
    case 'test':
      return <SearchIcon />;
    case 'security':
      return <SecurityIcon />;
    default:
      return <PsychologyIcon />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'error':
      return { bg: '#ffcdd2', text: '#c62828' };  // Darker red background, dark red text
    case 'warning':
      return { bg: '#ffe0b2', text: '#ef6c00' };  // Darker orange background, dark orange text
    case 'debug':
      return { bg: '#e0e0e0', text: '#424242' };  // Grey background, dark grey text
    case 'info':
      return { bg: '#bbdefb', text: '#1565c0' };  // Blue background, dark blue text
    default:
      return { bg: '#e0e0e0', text: '#424242' };  // Darker grey background, dark grey text
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
};

function Logs() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('logs', {
        page: currentPage,
        pageSize: pageSize
      });
      setLogs(data.items);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error.message || 'Failed to fetch logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          System Logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-label">Items per page</InputLabel>
          <Select
            labelId="page-size-label"
            value={pageSize}
            label="Items per page"
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {logs.map((log) => {
              const severityColors = getSeverityColor(log.severity);
              return (
                <Grid item xs={12} key={log.id}>
                  <Card 
                    sx={{ 
                      bgcolor: severityColors.bg,
                      color: severityColors.text,
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: 3,
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getLoggerIcon(log.logger)}
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {formatDate(log.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontSize: '1.3rem' }}>
                        {log.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </Typography>
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Logs; 