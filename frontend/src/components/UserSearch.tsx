import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface User {
  user_id: number;
  full_name: string;
  location: string;
  bio: string;
  gender: string;
}

interface UserDetails {
  age: number;
  bio: string;
  full_name: string;
  gender: string;
  interests: string[];
  location: string;
  user_id: number;
}

interface UserSearchProps {
  onAddFriend: (userId: number) => Promise<void>;
  userFriends: any[];
  sentRequests: number[];
  friendRequests: any[];
  onSelectFriend: (friendId: number) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ 
  onAddFriend, 
  userFriends, 
  sentRequests, 
  friendRequests,
  onSelectFriend
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
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
        
        const response = await axios.get(`${API_URL}/users/search?${queryParams}`);
        
        if (response.data) {
          setSearchResults(response.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
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

  // Handle friend request
  const handleFriendRequest = async (userId: number) => {
    setAddingFriend(userId);
    try {
      await onAddFriend(userId);
    } finally {
      setAddingFriend(null);
    }
  };

  // Handle user click to show details
  const handleUserClick = async (userId: number) => {
    try {
      setUserDetailsLoading(true);
      const response = await axios.get(`${API_URL}/users/${userId}`);
      setSelectedUser(response.data);
      setUserDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Search Users
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Search by name"
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
          {searchResults.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.user_id}>
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
                onClick={() => handleUserClick(user.user_id)}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: userFriends.some(f => f.friend_id === user.user_id) ? '#4caf50' : 
                           friendRequests.some(r => r.sender_id === user.user_id) ? '#ff9800' : 
                           sentRequests.includes(user.user_id) ? '#4caf50' : '#ff6b9b',
                    '&:hover': {
                      color: userFriends.some(f => f.friend_id === user.user_id) ? '#388e3c' : 
                             friendRequests.some(r => r.sender_id === user.user_id) ? '#f57c00' : 
                             sentRequests.includes(user.user_id) ? '#388e3c' : '#e05a89',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (userFriends.some(f => f.friend_id === user.user_id)) {
                      onSelectFriend(user.user_id);
                    } else if (!friendRequests.some(r => r.sender_id === user.user_id) && 
                               !sentRequests.includes(user.user_id)) {
                      handleFriendRequest(user.user_id);
                    }
                  }}
                  disabled={addingFriend === user.user_id}
                >
                  {addingFriend === user.user_id ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : userFriends.some(f => f.friend_id === user.user_id) ? (
                    <Tooltip title="Message">
                      <MessageIcon />
                    </Tooltip>
                  ) : friendRequests.some(r => r.sender_id === user.user_id) ? (
                    <Tooltip title="Request pending">
                      <HourglassEmptyIcon />
                    </Tooltip>
                  ) : sentRequests.includes(user.user_id) ? (
                    <Tooltip title="Request sent">
                      <CheckCircleIcon />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Add friend">
                      <PersonAddIcon />
                    </Tooltip>
                  )}
                </IconButton>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: '#ff6b9b',
                        fontSize: '1.5rem'
                      }}
                    >
                      {user.full_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{user.full_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.location}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {user.bio && (
                    <Typography variant="body2" paragraph sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {user.bio}
                    </Typography>
                  )}
                  
                  {friendRequests.some(r => r.sender_id === user.user_id) && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                      Friend request pending
                    </Typography>
                  )}
                  
                  {sentRequests.includes(user.user_id) && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      Waiting for acceptance
                    </Typography>
                  )}
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
            No users found matching your search.
          </Typography>
        </Box>
      ) : null}

      {/* User details dialog */}
      <Dialog 
        open={userDetailsOpen} 
        onClose={handleCloseUserDetails}
        maxWidth="sm"
        fullWidth
      >
        {userDetailsLoading ? (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        ) : selectedUser ? (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: '#915dac',
                  fontSize: '1.5rem'
                }}
              >
                {selectedUser.full_name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedUser.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.location} • {selectedUser.age} years old • {selectedUser.gender}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>About</Typography>
              <Typography variant="body1" paragraph>
                {selectedUser.bio}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Interests</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.from(new Set(selectedUser.interests)).map((interest, index) => (
                  <Chip 
                    key={index}
                    label={interest.trim()}
                    sx={{ 
                      bgcolor: '#f0e6f5',
                      '& .MuiChip-label': { color: '#915dac' }
                    }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUserDetails}>Close</Button>
              {userFriends.some(f => f.friend_id === selectedUser.user_id) ? (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleCloseUserDetails();
                    onSelectFriend(selectedUser.user_id);
                  }}
                  sx={{ 
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#388e3c' }
                  }}
                >
                  Message
                </Button>
              ) : friendRequests.some(r => r.sender_id === selectedUser.user_id) ? (
                <Button 
                  variant="contained" 
                  disabled
                  sx={{ 
                    bgcolor: '#ff9800',
                    '&:hover': { bgcolor: '#f57c00' }
                  }}
                >
                  Request Pending
                </Button>
              ) : sentRequests.includes(selectedUser.user_id) ? (
                <Button 
                  variant="contained" 
                  disabled
                  sx={{ 
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#388e3c' }
                  }}
                >
                  Request Sent
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    onAddFriend(selectedUser.user_id);
                    handleCloseUserDetails();
                  }}
                  sx={{ 
                    bgcolor: '#915dac',
                    '&:hover': { bgcolor: '#7d4e95' }
                  }}
                >
                  Add Friend
                </Button>
              )}
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
};

export default UserSearch; 