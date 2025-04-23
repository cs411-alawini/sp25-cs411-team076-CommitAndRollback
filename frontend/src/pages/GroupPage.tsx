import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupView from '../components/GroupView';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const GroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("GroupPage mounted with groupId:", groupId);
    // Validate groupId
    if (!groupId || isNaN(parseInt(groupId, 10))) {
      console.error("Invalid groupId:", groupId);
      setError('Invalid group ID');
      setLoading(false);
    } else {
      console.log("Valid groupId:", parseInt(groupId, 10));
      setLoading(false);
    }
  }, [groupId]);

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

  const groupIdNumber = groupId ? parseInt(groupId, 10) : 0;
  console.log("Rendering GroupView with groupId:", groupIdNumber);

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f9f9f9'
    }}>
      {groupId && (
        <GroupView 
          groupId={groupIdNumber} 
          onBack={handleBack} 
        />
      )}
    </Box>
  );
};

export default GroupPage; 