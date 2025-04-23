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
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
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
import MessageIcon from '@mui/icons-material/Message';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import axios from 'axios';
import GroupView from '../components/GroupView';
import UserSearch from '../components/UserSearch';
import GroupSearch from '../components/GroupSearch';

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

interface UserGroups {
  group_id: number;
  group_name: string;
}

interface UserFriend {
  user_id: number;
  full_name: string;
  bio: string;
  location: string;
  created_at: string;
  chat_id: number;
  friend_id: number;
}

interface FriendRequest {
  sender_id: number;
  receiver_id: number;
  status: string;
  sent_at: string;
  sender_name: string;
  receiver_name: string;
}

const ITEMS_PER_PAGE = 3;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [userGroups, setUserGroups] = useState<UserGroups[]>([]);
  const [userFriends, setUserFriends] = useState<UserFriend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [joiningGroup, setJoiningGroup] = useState<number | null>(null);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [showGroupView, setShowGroupView] = useState(false);
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const drawerWidth = 280;
  const collapsedDrawerWidth = 80;

  // Check if we're coming from a group or friend page to highlight the active group or friend
  useEffect(() => {
    const path = location.pathname;
    const groupMatches = path.match(/\/groups\/(\d+)/);
    const friendMatches = path.match(/\/friends\/(\d+)/);
    
    if (groupMatches && groupMatches[1]) {
      setSelectedGroup(parseInt(groupMatches[1], 10));
    } else if (friendMatches && friendMatches[1]) {
      setSelectedFriend(parseInt(friendMatches[1], 10));
    }
  }, [location]);

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
        
        // Fetch user groups
        const userGroupsResponse = await axios.get(`${API_URL}/users/${userId}/groups`);
        if (userGroupsResponse.data) {
          setUserGroups(userGroupsResponse.data);
        }
        
        // Fetch user friends
        const userFriendsResponse = await axios.get(`${API_URL}/users/${userId}/friends`);
        if (userFriendsResponse.data) {
          setUserFriends(userFriendsResponse.data);
        }
        
        // Fetch friend suggestions
        const suggestionsResponse = await axios.get(`${API_URL}/users/${userId}/recommendations`);
        if (suggestionsResponse.data) {
          setFriendSuggestions(suggestionsResponse.data);
        }
        
        // Fetch friend requests
        try {
          const friendRequestsResponse = await axios.get(`${API_URL}/users/${userId}/friend-requests`);
          if (friendRequestsResponse.data) {
            setFriendRequests(friendRequestsResponse.data);
          }
        } catch (requestsError) {
          console.warn('Could not fetch friend requests:', requestsError);
          setFriendRequests([]);
        }
        
        // Fetch sent friend requests
        try {
          const sentRequestsResponse = await axios.get(`${API_URL}/users/${userId}/sent-friend-requests`);
          if (sentRequestsResponse.data) {
            // Extract the receiver_id from each pending sent request and add to sentRequests array
            const pendingSentRequests = sentRequestsResponse.data
              .filter((request: any) => request.status === 'Pending')
              .map((request: any) => request.receiver_id);
            
            setSentRequests(pendingSentRequests);
            console.log("Loaded sent friend requests:", pendingSentRequests);
          }
        } catch (sentRequestsError) {
          console.warn('Could not fetch sent friend requests:', sentRequestsError);
        }
        
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

  // Handle join group
  const handleJoinGroup = async (groupId: number) => {
    console.log("Joining group with ID:", groupId);
    if (!groupId || isNaN(groupId)) {
      console.error("Invalid group ID:", groupId);
      return;
    }
    
    try {
      setJoiningGroup(groupId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.user_id;
      
      if (!userId) {
        console.error("No user ID found");
        return;
      }
      
      console.log(`Adding user ${userId} to group ${groupId}`);
      const response = await axios.post(`${API_URL}/groups/${groupId}/add-user`, {
        user_id: userId
      });
      
      console.log("Join group response:", response.data);
      
      if (response.data && !response.data.error) {
        // Get group details to add to userGroups
        const joinedGroup = groups.find(g => g.group_id === groupId);
        if (joinedGroup) {
          const newUserGroup = {
            group_id: joinedGroup.group_id,
            group_name: joinedGroup.group_name
          };
          setUserGroups([...userGroups, newUserGroup]);
          
          // Navigate to the group page after joining
          navigate(`/groups/${groupId}`);
        } else {
          console.error("Could not find joined group in groups list");
        }
      } else {
        console.error("Error in response:", response.data?.error || "Unknown error");
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    } finally {
      setJoiningGroup(null);
    }
  };

  // Handle group selection
  const handleGroupSelect = (groupId: number) => {
    console.log("Selecting group with ID:", groupId);
    if (!groupId || isNaN(groupId)) {
      console.error("Invalid group ID:", groupId);
      return;
    }
    
    setSelectedGroup(groupId);
    navigate(`/groups/${groupId}`);
  };

  // Handle back from group view
  const handleBackFromGroup = () => {
    setShowGroupView(false);
    setSelectedGroup(null);
  };

  // Handle friend selection
  const handleFriendSelect = (friendId: number) => {
    console.log("Selecting friend with ID:", friendId);
    if (!friendId || isNaN(friendId)) {
      console.error("Invalid friend ID:", friendId);
      return;
    }
    
    setSelectedFriend(friendId);
    navigate(`/friends/${friendId}`);
  };

  // Handle add friend
  const handleAddFriend = async (userId: number) => {
    console.log("Adding friend with ID:", userId);
    if (!userId || isNaN(userId)) {
      console.error("Invalid user ID:", userId);
      return;
    }
    
    try {
      setAddingFriend(userId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.user_id;
      
      if (!currentUserId) {
        console.error("No user ID found");
        return;
      }
      
      console.log(`Sending friend request from ${currentUserId} to ${userId}`);
      const response = await axios.post(`${API_URL}/users/${currentUserId}/friend-requests/${userId}`);
      
      console.log("Add friend response:", response.data);
      
      if (response.data && !response.data.error) {
        // Show success feedback
        console.log("Friend request sent successfully");
        // Add to sent requests list
        const updatedSentRequests = [...sentRequests, userId];
        setSentRequests(updatedSentRequests);
        
        // Show a success message to the user
        setNotification({
          message: "Friend request sent successfully!",
          type: "success"
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } else {
        console.error("Error in response:", response.data?.error || "Unknown error");
        setNotification({
          message: "Failed to send friend request. Please try again.",
          type: "error"
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error adding friend:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      setNotification({
        message: "Failed to send friend request. Please try again.",
        type: "error"
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setAddingFriend(null);
    }
  };

  // Handle accept friend request
  const handleAcceptFriendRequest = async (senderId: number) => {
    try {
      setProcessingRequest(senderId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.user_id;
      
      if (!currentUserId) {
        console.error("No user ID found");
        return;
      }
      
      const response = await axios.post(`${API_URL}/friend-requests/${senderId}/${currentUserId}/update`, {
        status: 'Accepted'
      });
      
      if (response.data && !response.data.error) {
        console.log("Friend request accepted successfully");
        
        // Update friend requests list
        setFriendRequests(friendRequests.filter(req => req.sender_id !== senderId));
        
        // Fetch updated friend list
        const friendsResponse = await axios.get(`${API_URL}/users/${currentUserId}/friends`);
        if (friendsResponse.data) {
          setUserFriends(friendsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };
  
  // Handle reject friend request
  const handleRejectFriendRequest = async (senderId: number) => {
    try {
      setProcessingRequest(senderId);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.user_id;
      
      if (!currentUserId) {
        console.error("No user ID found");
        return;
      }
      
      const response = await axios.post(`${API_URL}/friend-requests/${senderId}/${currentUserId}/update`, {
        status: 'Rejected'
      });
      
      if (response.data && !response.data.error) {
        console.log("Friend request rejected successfully");
        
        // Update friend requests list
        setFriendRequests(friendRequests.filter(req => req.sender_id !== senderId));
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Add a handler for leaving groups
  const handleLeaveGroup = async (groupId: number) => {
    if (!groupId || isNaN(groupId)) {
      console.error("Invalid group ID:", groupId);
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.user_id;
      
      if (!userId) {
        console.error("No user ID found");
        return;
      }
      
      // Confirm before leaving
      if (!window.confirm("Are you sure you want to leave this group?")) {
        return;
      }
      
      // Call the API to leave the group
      const response = await axios.post(`${API_URL}/groups/${groupId}/remove-user`, {
        user_id: userId
      });
      
      if (response.data && !response.data.error) {
        // Remove the group from userGroups state
        setUserGroups(userGroups.filter(g => g.group_id !== groupId));
        
        // Show success notification
        setNotification({
          message: "You have left the group successfully",
          type: "success"
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        
        // If the user is currently viewing this group, redirect to dashboard
        if (selectedGroup === groupId) {
          setSelectedGroup(null);
          setShowGroupView(false);
        }
      } else {
        // Show error notification
        setNotification({
          message: response.data?.error || "Failed to leave group. Please try again.",
          type: "error"
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error leaving group:', error);
      
      // Show error notification
      setNotification({
        message: "Failed to leave group. Please try again.",
        type: "error"
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
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
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            {drawerOpen && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6">Friends</Typography>
                {friendRequests.length > 0 && (
                  <Badge 
                    badgeContent={friendRequests.length} 
                    color="error"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        bgcolor: '#d32f2f',
                        fontSize: '0.7rem',
                        height: '20px',
                        minWidth: '20px'
                      } 
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => setRequestsOpen(!requestsOpen)}
                      sx={{ padding: 0.5 }}
                    >
                      <NotificationsIcon fontSize="small" />
                    </IconButton>
                  </Badge>
                )}
              </Box>
            )}
          </ListItem>
          
          {/* Friend Requests Section */}
          {drawerOpen && requestsOpen && friendRequests.length > 0 && (
            <>
              <ListItem sx={{ pl: 4 }}>
                <Typography variant="body2" color="textSecondary">Friend Requests</Typography>
              </ListItem>
              
              {friendRequests.map(request => (
                <ListItem 
                  key={request.sender_id}
                  sx={{ 
                    pl: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
                    <Avatar
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: '#ff6b9b',
                        fontSize: '0.9rem',
                        mr: 1.5
                      }}
                    >
                      {request.sender_name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{request.sender_name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, ml: 5 }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleAcceptFriendRequest(request.sender_id)}
                      disabled={processingRequest === request.sender_id}
                      sx={{ 
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1,
                        minWidth: 0,
                        bgcolor: '#4caf50',
                        '&:hover': { bgcolor: '#388e3c' }
                      }}
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleRejectFriendRequest(request.sender_id)}
                      disabled={processingRequest === request.sender_id}
                      sx={{ 
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1,
                        minWidth: 0,
                        borderColor: '#ff6b9b',
                        color: '#ff6b9b',
                        '&:hover': { 
                          borderColor: '#e05a89',
                          color: '#e05a89'
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </ListItem>
              ))}
              
              <Divider sx={{ my: 1 }} />
            </>
          )}
          
          {userFriends.map((friend) => (
            <ListItem 
              key={friend.friend_id} 
              sx={{ 
                pl: drawerOpen ? 4 : 2,
                cursor: 'pointer',
                bgcolor: selectedFriend === friend.friend_id ? 'rgba(255, 107, 155, 0.12)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 107, 155, 0.08)',
                }
              }}
              onClick={() => handleFriendSelect(friend.friend_id)}
            >
              {drawerOpen ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      bgcolor: '#ff6b9b',
                      fontSize: '0.9rem',
                      mr: 1.5
                    }}
                  >
                    {friend.full_name.charAt(0)}
                  </Avatar>
                  <ListItemText primary={friend.full_name} sx={{ m: 0 }} />
                </Box>
              ) : (
                <Tooltip title={friend.full_name} placement="right">
                  <Avatar
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#ff6b9b',
                      fontSize: '1.1rem'
                    }}
                  >
                    {friend.full_name.charAt(0)}
                  </Avatar>
                </Tooltip>
              )}
            </ListItem>
          ))}
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
              {userGroups.map((group) => (
                <ListItem 
                  key={group.group_id} 
                  sx={{ 
                    pl: drawerOpen ? 4 : 2,
                    cursor: 'pointer',
                    bgcolor: selectedGroup === group.group_id ? 'rgba(145, 93, 172, 0.12)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(145, 93, 172, 0.08)',
                    },
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box 
                    onClick={() => handleGroupSelect(group.group_id)} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      flexGrow: 1,
                      overflow: 'hidden'
                    }}
                  >
                    {drawerOpen && <Typography component="span" sx={{ mr: 2 }}>#</Typography>}
                    {drawerOpen ? (
                      <ListItemText primary={group.group_name} />
                    ) : (
                      <Tooltip title={group.group_name} placement="right">
                        <Typography component="span" sx={{ mr: 2 }}>#</Typography>
                      </Tooltip>
                    )}
                  </Box>
                  {drawerOpen && (
                    <Tooltip title="Leave group">
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(group.group_id);
                        }}
                        sx={{ 
                          fontSize: '0.85rem',
                          opacity: 0.5,
                          '&:hover': {
                            opacity: 1,
                            color: '#d32f2f'
                          }
                        }}
                      >
                        <ExitToAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              ))}
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
          p: 3,
          pt: 2,
          pb: 6.25,
          px: 6.25,
          bgcolor: '#f9f9f9',
          overflow: 'auto',
          transition: 'width 0.3s ease-in-out',
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)`,
          marginLeft: 'auto'
        }}
      >
        {showGroupView && selectedGroup ? (
          <GroupView groupId={selectedGroup} onBack={handleBackFromGroup} />
        ) : (
          <>
            {/* Top Navigation Bar */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              mb: 2,
              mt: 0
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

            {/* Tab system */}
            <Box sx={{ width: '100%', mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': { 
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'rgba(0, 0, 0, 0.6)'
                  },
                  '& .Mui-selected': { 
                    color: '#915dac',
                    fontWeight: 600
                  },
                  '& .MuiTabs-indicator': { 
                    backgroundColor: '#915dac',
                    height: 3
                  }
                }}
              >
                <Tab label="Home" />
                <Tab label="Search Users" />
                <Tab label="Search Groups" />
              </Tabs>
            </Box>

            {/* Home Tab (Group Chats and Find Friends) */}
            {activeTab === 0 && (
              <>
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
                            {userGroups.some(g => g.group_id === group.group_id) ? (
                              <Button 
                                variant="contained" 
                                size="small"
                                onClick={() => navigate(`/groups/${group.group_id}`)}
                                sx={{ 
                                  bgcolor: '#915dac', 
                                  '&:hover': { bgcolor: '#7d4e95' },
                                  borderRadius: 20,
                                  px: 3
                                }}
                              >
                                View Group
                              </Button>
                            ) : (
                              <Button 
                                variant="contained" 
                                size="small"
                                disabled={joiningGroup === group.group_id}
                                onClick={() => handleJoinGroup(group.group_id)}
                                sx={{ 
                                  bgcolor: '#915dac', 
                                  '&:hover': { bgcolor: '#7d4e95' },
                                  borderRadius: 20,
                                  px: 3
                                }}
                              >
                                {joiningGroup === group.group_id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  'Join Group'
                                )}
                              </Button>
                            )}
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
                              color: userFriends.some(f => f.friend_id === friend.recommended_user_id) ? '#4caf50' : 
                                     friendRequests.some(r => r.sender_id === friend.recommended_user_id) ? '#ff9800' : 
                                     sentRequests.includes(friend.recommended_user_id) ? '#4caf50' : '#ff6b9b',
                              '&:hover': {
                                color: userFriends.some(f => f.friend_id === friend.recommended_user_id) ? '#388e3c' : 
                                       friendRequests.some(r => r.sender_id === friend.recommended_user_id) ? '#f57c00' : 
                                       sentRequests.includes(friend.recommended_user_id) ? '#388e3c' : '#e05a89',
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (userFriends.some(f => f.friend_id === friend.recommended_user_id)) {
                                // Already friends - open chat
                                handleFriendSelect(friend.recommended_user_id);
                              } else if (!friendRequests.some(r => r.sender_id === friend.recommended_user_id) && 
                                         !sentRequests.includes(friend.recommended_user_id)) {
                                // Not friends or request pending - send request
                                handleAddFriend(friend.recommended_user_id);
                              }
                              // If request is pending or already sent, do nothing on click
                            }}
                            disabled={addingFriend === friend.recommended_user_id}
                          >
                            {addingFriend === friend.recommended_user_id ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : userFriends.some(f => f.friend_id === friend.recommended_user_id) ? (
                              <MessageIcon />
                            ) : friendRequests.some(r => r.sender_id === friend.recommended_user_id) ? (
                              <HourglassEmptyIcon />
                            ) : sentRequests.includes(friend.recommended_user_id) ? (
                              <Tooltip title="Friend request sent">
                                <CheckCircleIcon />
                              </Tooltip>
                            ) : (
                              <AddIcon />
                            )}
                          </IconButton>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 56, 
                                height: 56, 
                                bgcolor: '#ff6b9b',
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
                              {friendRequests.some(r => r.sender_id === friend.recommended_user_id) && (
                                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                                  Friend request pending
                                </Typography>
                              )}
                              {sentRequests.includes(friend.recommended_user_id) && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                                  Waiting for acceptance
                                </Typography>
                              )}
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
              </>
            )}

            {/* Search Users Tab */}
            {activeTab === 1 && (
              <UserSearch 
                onAddFriend={handleAddFriend}
                userFriends={userFriends}
                sentRequests={sentRequests}
                friendRequests={friendRequests}
                onSelectFriend={handleFriendSelect}
              />
            )}
            
            {/* Search Groups Tab */}
            {activeTab === 2 && (
              <GroupSearch 
                onJoinGroup={handleJoinGroup}
                userGroups={userGroups}
                joiningGroup={joiningGroup}
              />
            )}
          </>
        )}
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
              {selectedUser && (
                userFriends.some(f => f.friend_id === selectedUser.user_id) ? (
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      handleCloseUserDetails();
                      handleFriendSelect(selectedUser.user_id);
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
                      handleAddFriend(selectedUser.user_id);
                      handleCloseUserDetails();
                    }}
                    sx={{ 
                      bgcolor: '#915dac',
                      '&:hover': { bgcolor: '#7d4e95' }
                    }}
                  >
                    Add Friend
                  </Button>
                )
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notification */}
      {notification && (
        <Box 
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            padding: 2,
            borderRadius: 1,
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 1400,
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Typography>{notification.message}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 