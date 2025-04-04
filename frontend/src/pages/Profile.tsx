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

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
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
          <ListItem 
            component="div"
            onClick={() => navigate('/me')}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary="Profile" />}
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
            <IconButton size="large">
              <NotificationsIcon />
            </IconButton>
            <IconButton size="large" onClick={() => navigate('/dashboard')}>
              <HomeIcon />
            </IconButton>
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
              navigate('/me');
            }}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              handleLogout();
            }}>
              Logout
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
      </Box>
    </Box>
  );
};

export default Profile; 