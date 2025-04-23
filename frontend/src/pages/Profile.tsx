import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  InputBase, 
  IconButton, 
  Paper,
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Button,
  Chip,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  Autocomplete,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface UserDetails {
  age: number;
  bio: string;
  full_name: string;
  gender: string;
  interests: string[];
  location: string;
  user_id: number;
}

interface Interest {
  interest_id: number;
  interest_name: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserDetails>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  
  const drawerWidth = 280;
  const collapsedDrawerWidth = 80;

  // Fetch user data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.user_id;
      
      if (!userId) {
        navigate('/login');
        return;
      }
      
      try {
        const userResponse = await axios.get(`${API_URL}/users/${userId}`);
        if (userResponse.data) {
          setUserDetails(userResponse.data);
        }
        
        // Fetch all available interests
        const interestsResponse = await axios.get(`${API_URL}/interests`);
        if (interestsResponse.data) {
          // Store all interests with their IDs
          setAllInterests(interestsResponse.data);
          
          // Extract unique interest names
          const uniqueInterests = Array.from(
            new Set(
              interestsResponse.data.map((interest: Interest) => interest.interest_name.trim())
            )
          ).sort() as string[];
          setAvailableInterests(uniqueInterests);
        }
        
        setLoading(false);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditFormData({
      full_name: userDetails?.full_name || '',
      age: userDetails?.age || 0,
      gender: userDetails?.gender || '',
      location: userDetails?.location || '',
      bio: userDetails?.bio || '',
      interests: userDetails?.interests || [],
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleInterestsChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    // Remove any duplicates from the selected interests
    const uniqueInterests = Array.from(new Set(newValue.map(interest => interest.trim())));
    
    setEditFormData(prev => ({
      ...prev,
      interests: uniqueInterests
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setEditError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get current user details first to get the password and created_at
      const currentUserResponse = await axios.get(`${API_URL}/users/${user.user_id}`);
      if (!currentUserResponse.data) {
        throw new Error('Failed to fetch current user details');
      }
      
      // Separate interests from other user details
      const { interests, ...userDetailsToUpdate } = editFormData;
      
      // Only send the request if there are fields to update
      if (Object.keys(userDetailsToUpdate).length > 0) {
        // Include password and created_at from current user data
        const updatedUserData = {
          ...userDetailsToUpdate,
          password: currentUserResponse.data.password,
          created_at: currentUserResponse.data.created_at
        };
        
        console.log('Updating user details with:', updatedUserData);
        
        const response = await axios.patch(
          `${API_URL}/users/${user.user_id}/details`,
          updatedUserData
        );

        if (response.data) {
          setUserDetails(prev => ({
            ...response.data,
            interests: interests || prev?.interests || []
          }));
        }
      }

      // Separately update interests if they were changed
      if (interests !== undefined) {
        // Convert interest names to interest IDs
        const interestIds = interests.map(interestName => {
          const interest = allInterests.find(i => 
            i.interest_name.trim().toLowerCase() === interestName.trim().toLowerCase()
          );
          return interest ? interest.interest_id : null;
        }).filter(id => id !== null);
        
        await axios.patch(
          `${API_URL}/users/${user.user_id}/interests`,
          { interests: interestIds }
        );
      }

      handleEditClose();
    } catch (error: any) {
      console.error('Update error:', error);
      // Display exact error message from backend when status is 400
      if (error.response && error.response.status === 400) {
        setEditError(error.response.data.error || 'Failed to update profile');
      } else {
        setEditError(error.message || 'Failed to update profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.user_id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await axios.delete(`${API_URL}/users/${userId}`);
      
      // Clear user data from local storage
      localStorage.removeItem('user');
      localStorage.removeItem('newSignup');
      
      // Redirect to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Delete account error:', error);
      
      // Display the exact error message from the backend when status is 400
      if (error.response && error.response.status === 400) {
        setDeleteError(error.response.data.error || 'Failed to delete account');
      } else {
        setDeleteError(error.response?.data?.error || 'Failed to delete account');
      }
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>Return to Login</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out',
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#f0e6f5',
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
            zIndex: 1,
          },
        }}
      >
        <Box p={2} sx={{ position: 'relative', pb: 4 }}>
          {drawerOpen ? (
            <>
              <Box 
                component="img" 
                src="/img/logo.svg" 
                alt="Synapo Logo" 
                sx={{ 
                  height: 40,
                  position: 'absolute',
                  left: 16,
                  top: 16
                }} 
              />
              <Tooltip title="Collapse sidebar">
                <IconButton 
                  onClick={() => setDrawerOpen(false)}
                  sx={{ 
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    bgcolor: '#fff',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Expand sidebar">
                <IconButton 
                  onClick={() => setDrawerOpen(true)}
                  sx={{ 
                    bgcolor: '#fff',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        <List>
          <ListItem 
            component="div"
            onClick={() => navigate('/')}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary="Dashboard" />}
          </ListItem>
        </List>
        
        <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#f0e6f5' }}>
          <Divider />
          <ListItem 
            component="div"
            onClick={() => navigate('/me')}
            sx={{ 
              py: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ bgcolor: '#ff6b9b' }}>
                {userDetails?.full_name.charAt(0)}
              </Avatar>
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText 
                primary={userDetails?.full_name} 
                secondary={userDetails?.location}
              />
            )}
          </ListItem>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 6.25,
          bgcolor: '#f9f9f9',
          overflow: 'auto',
          transition: 'width 0.3s ease-in-out',
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)`,
          marginLeft: 'auto'
        }}
      >
        {/* Top Navigation Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mb: 4,
          mt: 1
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
              size="large"
              onClick={handleMenuClick}
              sx={{
                '&:hover': { bgcolor: 'rgba(145, 93, 172, 0.08)' }
              }}
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/dashboard');
            }}>
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              handleLogout();
            }}>
              Logout
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                setDeleteDialogOpen(true);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              Delete Account
            </MenuItem>
          </Menu>
        </Box>

        {/* Profile Content */}
        {userDetails && (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 4, 
              mb: 6,
              position: 'relative'
            }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: '#915dac',
                  fontSize: '3rem'
                }}
              >
                {userDetails.full_name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h4" component="h1">
                    {userDetails.full_name}
                  </Typography>
                  <IconButton 
                    onClick={handleEditClick}
                    sx={{ 
                      bgcolor: '#f0e6f5',
                      '&:hover': { bgcolor: '#e1d1e8' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {userDetails.location}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                  <Typography>{userDetails.age} years old</Typography>
                  <Typography>•</Typography>
                  <Typography>{userDetails.gender}</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#915dac' }}>
                About Me
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {userDetails.bio}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: '#915dac' }}>
                My Interests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.from(new Set(userDetails.interests)).map((interest, index) => (
                  <Chip 
                    key={index}
                    label={interest.trim()}
                    sx={{ 
                      bgcolor: '#f0e6f5',
                      '& .MuiChip-label': { 
                        color: '#915dac',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.95rem'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Edit Profile Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={editFormData.full_name || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={editFormData.age || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                value={editFormData.gender || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={editFormData.location || ''}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={editFormData.bio || ''}
                onChange={handleInputChange}
              />
              <Autocomplete
                multiple
                options={availableInterests}
                value={editFormData.interests || []}
                onChange={handleInterestsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Interests"
                    placeholder="Select interests"
                  />
                )}
                renderTags={(value: string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
              {editError && (
                <Typography color="error" variant="body2">
                  {editError}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText color="text.primary">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogContentText>
            <DialogContentText color="text.primary" sx={{ mt: 2, mb: 3 }}>
              To confirm, please type <strong>DELETE</strong> in the field below:
            </DialogContentText>
            <TextField
              fullWidth
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {deleteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount}
              variant="contained" 
              color="error"
              disabled={isDeleting}
              startIcon={<DeleteIcon />}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Profile; 