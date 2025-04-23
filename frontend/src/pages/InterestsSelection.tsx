import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  Button,
  Container,
  Paper,
  CircularProgress,
  Grid,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Interest {
  interest_id: number;
  interest_name: string;
}

const InterestsSelection = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get the user information from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Check if user is logged in
    if (!user.user_id) {
      navigate('/login');
      return;
    }

    // Check if this is a new signup
    const newSignup = localStorage.getItem('newSignup') === 'true';
    setIsNewUser(newSignup);

    // Fetch all interests
    const fetchInterests = async () => {
      try {
        const response = await axios.get(`${API_URL}/interests`);
        if (response.data) {
          // Filter out duplicate interests based on interest_name
          const uniqueInterests = filterUniqueInterests(response.data);
          setInterests(uniqueInterests);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load interests');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [navigate, user.user_id]);

  // Function to filter unique interests based on interest_name
  const filterUniqueInterests = (interestsList: Interest[]): Interest[] => {
    const uniqueNames = new Set();
    return interestsList.filter(interest => {
      // Normalize the interest name (trim and lowercase)
      const normalizedName = interest.interest_name.trim().toLowerCase();
      
      // If this name hasn't been seen before, keep it
      if (!uniqueNames.has(normalizedName)) {
        uniqueNames.add(normalizedName);
        return true;
      }
      return false;
    });
  };

  const handleInterestClick = (interestId: number) => {
    setSelectedInterests(prevSelected => {
      if (prevSelected.includes(interestId)) {
        return prevSelected.filter(id => id !== interestId);
      } else {
        return [...prevSelected, interestId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/users/${user.user_id}/interests`, {
        interests: selectedInterests
      });
      
      // Clear new signup flag
      localStorage.removeItem('newSignup');
      
      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save interests');
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Clear new signup flag
    localStorage.removeItem('newSignup');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        overflow: 'auto'
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          width: '100%',
          maxWidth: 'md',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"}
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: '#915dac',
              textAlign: 'center' 
            }}
          >
            {isNewUser ? `Welcome, ${user.full_name}!` : 'Select Your Interests'}
          </Typography>
          
          <Typography 
            variant={isMobile ? "body1" : "h6"}
            sx={{ 
              color: '#666', 
              textAlign: 'center' 
            }}
          >
            {isNewUser 
              ? 'Select your interests to help us personalize your experience'
              : 'Update your interests to find better matches'}
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        <Box 
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            mb: 3,
            pr: 1
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              fontWeight: 600 
            }}
          >
            Select at least one interest:
          </Typography>
          
          <Grid container spacing={1}>
            {interests.length > 0 ? (
              interests.map(interest => (
                <Grid item key={interest.interest_id}>
                  <Chip
                    label={interest.interest_name}
                    clickable
                    onClick={() => handleInterestClick(interest.interest_id)}
                    color={selectedInterests.includes(interest.interest_id) ? "primary" : "default"}
                    sx={{
                      borderRadius: '16px',
                      pl: 0.5,
                      pr: 0.5,
                      m: 0.5,
                      bgcolor: selectedInterests.includes(interest.interest_id) ? '#f0e6f5' : '#f5f5f5',
                      color: selectedInterests.includes(interest.interest_id) ? '#915dac' : '#666',
                      border: selectedInterests.includes(interest.interest_id) ? '1px solid #915dac' : 'none',
                      '&:hover': {
                        bgcolor: selectedInterests.includes(interest.interest_id) ? '#e3d5e9' : '#eaeaea',
                      },
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ width: '100%', py: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No interests found</Typography>
              </Box>
            )}
          </Grid>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid #eee'
          }}
        >
          <Button
            variant="outlined"
            onClick={handleSkip}
            fullWidth={isMobile}
            sx={{
              color: '#666',
              borderColor: '#ccc',
              px: 3,
              borderRadius: 28,
              textTransform: 'none',
              order: isMobile ? 2 : 1,
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f9f9f9'
              }
            }}
          >
            Skip for now
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || selectedInterests.length === 0}
            fullWidth={isMobile}
            sx={{
              bgcolor: '#ff6b9b',
              color: 'white',
              px: 4,
              borderRadius: 28,
              textTransform: 'none',
              fontWeight: 600,
              order: isMobile ? 1 : 2,
              '&:hover': {
                bgcolor: '#ff4983'
              },
              '&.Mui-disabled': {
                bgcolor: '#ffccd9',
                color: 'white'
              }
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InterestsSelection; 