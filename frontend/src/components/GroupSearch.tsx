import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Group {
  group_id: number;
  group_name: string;
  created_at: string;
  member_count: number;
  created_by: number;
  interest_id: number;
  description?: string;
}

interface GroupDetails {
  group_id: number;
  group_name: string;
  created_at: string;
  created_by: number;
  interest_id: number;
  member_count: number;
  description?: string;
  interests?: string[];
}

interface GroupSearchProps {
  onJoinGroup: (groupId: number) => Promise<void>;
  userGroups: any[];
  joiningGroup: number | null;
}

const GroupSearch: React.FC<GroupSearchProps> = ({ 
  onJoinGroup, 
  userGroups,
  joiningGroup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [groupDetailsLoading, setGroupDetailsLoading] = useState(false);
  const navigate = useNavigate();

  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 3) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.user_id;
        
        // Build query parameters
        let queryParams = `q=${encodeURIComponent(term)}&user_id=${userId}`;
        
        const response = await axios.get(`${API_URL}/groups/search?${queryParams}`);
        
        if (response.data) {
          setSearchResults(response.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching groups:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Trigger debounced search when search term changes
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 3) {
      setLoading(true);
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
    
    // Cleanup debounced search on component unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  // Handle join group
  const handleJoinGroupClick = async (groupId: number) => {
    try {
      await onJoinGroup(groupId);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  // Handle group click to show details
  const handleGroupClick = async (groupId: number) => {
    try {
      setGroupDetailsLoading(true);
      const response = await axios.get(`${API_URL}/groups/${groupId}`);
      setSelectedGroup(response.data);
      setGroupDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setGroupDetailsLoading(false);
    }
  };

  const handleCloseGroupDetails = () => {
    setGroupDetailsOpen(false);
    setSelectedGroup(null);
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Search Groups
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Search by group name"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size={24} />
              </InputAdornment>
            ) : null
          }}
          placeholder="Type at least 3 characters to search"
          helperText={searchTerm && searchTerm.length < 3 ? "Enter at least 3 characters to search" : " "}
          FormHelperTextProps={{ 
            sx: { 
              visibility: searchTerm && searchTerm.length < 3 ? 'visible' : 'hidden',
              m: 1,
              minHeight: '1.25rem'
            } 
          }}
        />
      </Box>
      
      {/* Search results */}
      {searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.group_id}>
              <Card 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => handleGroupClick(group.group_id)}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: userGroups.some(g => g.group_id === group.group_id) ? '#4caf50' : '#915dac',
                    '&:hover': {
                      color: userGroups.some(g => g.group_id === group.group_id) ? '#388e3c' : '#7d4e95',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (userGroups.some(g => g.group_id === group.group_id)) {
                      navigate(`/groups/${group.group_id}`);
                    } else {
                      handleJoinGroupClick(group.group_id);
                    }
                  }}
                  disabled={joiningGroup === group.group_id}
                >
                  {joiningGroup === group.group_id ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : userGroups.some(g => g.group_id === group.group_id) ? (
                    <Tooltip title="View Group">
                      <CheckCircleIcon />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Join Group">
                      <AddCircleIcon />
                    </Tooltip>
                  )}
                </IconButton>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: '#f0e6f5', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      color: '#915dac',
                      fontSize: '1.5rem'
                    }}>
                      {group.group_name.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="h6">{group.group_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip 
                      icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                      label={group.member_count} 
                      size="small" 
                      sx={{ bgcolor: '#f5f5f5' }} 
                    />
                    
                    {userGroups.some(g => g.group_id === group.group_id) && (
                      <Typography variant="caption" color="success.main">
                        Member
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : searchTerm && searchTerm.length >= 3 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No groups found matching your search.
          </Typography>
        </Box>
      ) : null}

      {/* Group details dialog */}
      <Dialog 
        open={groupDetailsOpen} 
        onClose={handleCloseGroupDetails}
        maxWidth="sm"
        fullWidth
      >
        {groupDetailsLoading ? (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        ) : selectedGroup ? (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Box sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: '#f0e6f5', 
                borderRadius: '50%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: '#915dac',
                fontSize: '1.5rem'
              }}>
                {selectedGroup.group_name.charAt(0)}
              </Box>
              <Box>
                <Typography variant="h6">{selectedGroup.group_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Created on {new Date(selectedGroup.created_at).toLocaleDateString()} • {selectedGroup.member_count} members
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedGroup.description && (
                <>
                  <Typography variant="h6" gutterBottom>About</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedGroup.description}
                  </Typography>
                </>
              )}
              
              {selectedGroup.interests && selectedGroup.interests.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Topics</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from(new Set(selectedGroup.interests)).map((interest, index) => (
                      <Chip 
                        key={index}
                        label={interest}
                        sx={{ 
                          bgcolor: '#f0e6f5',
                          '& .MuiChip-label': { color: '#915dac' }
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseGroupDetails}>Close</Button>
              {selectedGroup && (
                userGroups.some(g => g.group_id === selectedGroup.group_id) ? (
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      handleCloseGroupDetails();
                      navigate(`/groups/${selectedGroup.group_id}`);
                    }}
                    sx={{ 
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#388e3c' }
                    }}
                  >
                    View Group
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      handleJoinGroupClick(selectedGroup.group_id);
                      handleCloseGroupDetails();
                    }}
                    disabled={joiningGroup === selectedGroup.group_id}
                    sx={{ 
                      bgcolor: '#915dac',
                      '&:hover': { bgcolor: '#7d4e95' }
                    }}
                  >
                    {joiningGroup === selectedGroup.group_id ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Join Group'
                    )}
                  </Button>
                )
              )}
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
};

export default GroupSearch; 