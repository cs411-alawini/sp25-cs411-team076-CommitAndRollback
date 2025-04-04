import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  InputBase, 
  IconButton, 
  Paper, 
  Grid, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Card, 
  CardContent, 
  CardActions, 
  Avatar, 
  Button,
  Chip,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Define types for API responses
interface Group {
  chat_id: number;
  created_at: string;
  created_by: number;
  group_id: number;
  group_name: string;
  interest_id: number;
  member_count: number;
}

interface FriendSuggestion {
  recommended_user_id: number;
  recommended_user_name: string;
  age_difference: number;
  common_interests: number;
}

interface UnreadGroup {
  group_id: number;
  group_name: string;
  unread_count: number;
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

const ITEMS_PER_PAGE = 3;

const Dashboard = () => {
  const navigate = useNavigate();
  const [unreadExpanded, setUnreadExpanded] = useState(true);
  const [groupsPage, setGroupsPage] = useState(0);
  const [friendsPage, setFriendsPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  // State for data from API
  const [groups, setGroups] = useState<Group[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>([]);
  const [unreadGroups, setUnreadGroups] = useState<UnreadGroup[]>([]);
  const [userData, setUserData] = useState({
    name: "",
    location: "",
    avatar: ""
  });
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const drawerWidth = 280;
  const collapsedDrawerWidth = 80;

  // Fetch data from backend
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
        // Fetch groups
        const groupsResponse = await axios.get(`${API_URL}/groups`);
        if (groupsResponse.data) {
          setGroups(groupsResponse.data);
        }
        
        // Fetch friend suggestions
        const suggestionsResponse = await axios.get(`${API_URL}/users/${userId}/recommendations`);
        if (suggestionsResponse.data) {
          setFriendSuggestions(suggestionsResponse.data);
        }
        
        // Fetch unread messages
        // try {
        //   const unreadResponse = await axios.get(`${API_URL}/users/${userId}/unread`);
        //   if (unreadResponse.data) {
        //     setUnreadGroups(unreadResponse.data);
        //   }
        // } catch (unreadError) {
        //   console.warn('Could not fetch unread messages:', unreadError);
        //   setUnreadGroups([]);
        // }
        
        // Fetch user data
        const userResponse = await axios.get(`${API_URL}/users/${userId}`);
        if (userResponse.data) {
          setUserData({
            name: userResponse.data.full_name || "User",
            location: userResponse.data.location || "Unknown",
            avatar: userResponse.data.avatar || ""
          });
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

  // Calculate total pages
  const totalGroupPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
  const totalFriendPages = Math.ceil(friendSuggestions.length / ITEMS_PER_PAGE);

  // Get current items
  const currentGroups = groups.slice(
    groupsPage * ITEMS_PER_PAGE, 
    (groupsPage + 1) * ITEMS_PER_PAGE
  );
  
  const currentFriends = friendSuggestions.slice(
    friendsPage * ITEMS_PER_PAGE, 
    (friendsPage + 1) * ITEMS_PER_PAGE
  );

  // Handle navigation
  const nextGroupsPage = () => {
    setGroupsPage((prevPage) => (prevPage + 1) % totalGroupPages);
  };

  const prevGroupsPage = () => {
    setGroupsPage((prevPage) => (prevPage - 1 + totalGroupPages) % totalGroupPages);
  };

  const nextFriendsPage = () => {
    setFriendsPage((prevPage) => (prevPage + 1) % totalFriendPages);
  };

  const prevFriendsPage = () => {
    setFriendsPage((prevPage) => (prevPage - 1 + totalFriendPages) % totalFriendPages);
  };
  
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

  // Add new function to fetch and show user details
  const handleUserClick = async (userId: number) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      setSelectedUser(response.data);
      setUserDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setSelectedUser(null);
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
          <ListItem>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary={<Typography variant="h6">Friends</Typography>} />}
          </ListItem>
        </List>
        
        <Divider />
        
        <List>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {drawerOpen && <Typography variant="subtitle1">Group Chats</Typography>}
            <IconButton size="small" onClick={() => setUnreadExpanded(!unreadExpanded)}>
              {unreadExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          </ListItem>
          
          {unreadExpanded && (
            <>
              {drawerOpen && (
                <ListItem sx={{ pl: 4 }}>
                  <Typography variant="body2" color="textSecondary">Unread</Typography>
                </ListItem>
              )}
              
              {unreadGroups.map((group) => (
                <ListItem key={group.group_id} sx={{ pl: drawerOpen ? 4 : 2 }}>
                  {drawerOpen && <Typography component="span" sx={{ mr: 2 }}>#</Typography>}
                  {drawerOpen ? (
                    <ListItemText primary={group.group_name} />
                  ) : (
                    <Tooltip title={group.group_name} placement="right">
                      <Typography component="span" sx={{ mr: 2 }}>#</Typography>
                    </Tooltip>
                  )}
                  <Badge 
                    badgeContent={group.unread_count} 
                    color="error" 
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        bgcolor: '#d32f2f',
                        fontSize: '0.7rem',
                        height: '20px',
                        minWidth: '20px'
                      } 
                    }}
                  />
                </ListItem>
              ))}
              
              {drawerOpen && (
                <ListItem sx={{ pl: 4 }}>
                  <Typography variant="body2" color="textSecondary">Read</Typography>
                </ListItem>
              )}
            </>
          )}
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
                {userData.name.charAt(0)}
              </Avatar>
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText 
                primary={userData.name} 
                secondary={userData.location}
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
            <IconButton size="large">
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

        {/* Group Chats Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
            Group Chats
          </Typography>
          <Grid container spacing={3} sx={{ position: 'relative' }}>
            {currentGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.group_id}>
                <Card sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ width: 50, height: 50, bgcolor: '#f5f5f5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="h6">{group.group_name.charAt(0)}</Typography>
                      </Box>
                      <Typography variant="h6" component="h3">
                        {group.group_name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Created on {new Date(group.created_at).toLocaleDateString()}
                    </Typography>
                    {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Interest ID: {group.interest_id}
                      </Typography>
                    </Box> */}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        bgcolor: '#915dac', 
                        '&:hover': { bgcolor: '#7d4e95' },
                        borderRadius: 20,
                        px: 3
                      }}
                    >
                      Join Group
                    </Button>
                    <Chip 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 16 }} />
                          {group.member_count}
                        </Box>
                      }
                      size="small" 
                      sx={{ bgcolor: '#f5f5f5' }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
            
            {/* Navigation Arrows */}
            {totalGroupPages > 1 && (
              <>
                <Box sx={{ 
                  position: 'absolute', 
                  left: -20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}>
                  <IconButton 
                    sx={{ 
                      bgcolor: '#fff', 
                      boxShadow: 2,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      }
                    }}
                    onClick={prevGroupsPage}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  right: -20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}>
                  <IconButton 
                    sx={{ 
                      bgcolor: '#fff', 
                      boxShadow: 2,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      }
                    }}
                    onClick={nextGroupsPage}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </>
            )}
            
            {/* Page indicator */}
            {totalGroupPages > 1 && (
              <Box sx={{ 
                position: 'absolute', 
                bottom: -30, 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}>
                {Array.from({ length: totalGroupPages }).map((_, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: index === groupsPage ? '#915dac' : '#e0e0e0' 
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Box>

        {/* Find Friends Section */}
        <Box>
          <Typography variant="h4" component="h2" sx={{ mb: 3, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
            Find Friends
          </Typography>
          <Grid container spacing={3} sx={{ position: 'relative' }}>
            {currentFriends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} key={friend.recommended_user_id}>
                <Card 
                  sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    p: 2,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleUserClick(friend.recommended_user_id)}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: '#915dac',
                      '&:hover': {
                        color: '#7d4e95',
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add friend logic here
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: '#915dac',
                        fontSize: '1.5rem'
                      }}
                    >
                      {friend.recommended_user_name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h3">
                        {friend.recommended_user_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {friend.common_interests} common interests
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
            
            {/* Navigation Arrows */}
            {totalFriendPages > 1 && (
              <>
                <Box sx={{ 
                  position: 'absolute', 
                  left: -20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}>
                  <IconButton 
                    sx={{ 
                      bgcolor: '#fff', 
                      boxShadow: 2,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      }
                    }}
                    onClick={prevFriendsPage}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  right: -20, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}>
                  <IconButton 
                    sx={{ 
                      bgcolor: '#fff', 
                      boxShadow: 2,
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      }
                    }}
                    onClick={nextFriendsPage}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </>
            )}
            
            {/* Page indicator */}
            {totalFriendPages > 1 && (
              <Box sx={{ 
                position: 'absolute', 
                bottom: -30, 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}>
                {Array.from({ length: totalFriendPages }).map((_, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: index === friendsPage ? '#ff6b9b' : '#e0e0e0' 
                    }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Add User Details Dialog */}
      <Dialog 
        open={userDetailsOpen} 
        onClose={handleCloseUserDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
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
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: '#915dac',
                  '&:hover': { bgcolor: '#7d4e95' }
                }}
              >
                Add Friend
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Dashboard; 