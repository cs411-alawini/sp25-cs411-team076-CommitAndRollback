import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FriendChat from '../components/FriendChat';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const FriendPage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("FriendPage mounted with friendId:", friendId);
    // Validate friendId
    if (!friendId || isNaN(parseInt(friendId, 10))) {
      console.error("Invalid friendId:", friendId);
      setError('Invalid friend ID');
      setLoading(false);
    } else {
      console.log("Valid friendId:", parseInt(friendId, 10));
      setLoading(false);
    }
  }, [friendId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <IconButton onClick={handleBack} sx={{ bgcolor: '#f0e6f5' }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  const friendIdNumber = friendId ? parseInt(friendId, 10) : 0;
  console.log("Rendering FriendChat with friendId:", friendIdNumber);

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f9f9f9'
    }}>
      {friendId && (
        <FriendChat 
          friendId={friendIdNumber} 
          onBack={handleBack} 
        />
      )}
    </Box>
  );
};

export default FriendPage; 