import React, { useState, useEffect, useRef } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider, 
  TextField, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Send as SendIcon, 
  People as PeopleIcon, 
  Event as EventIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './GroupView.css';

// Get API URL from config
const API_URL = `${API_BASE_URL}/api`;

interface GroupMessage {
  message_id: number;
  sender_id: number;
  sender_name: string;
  message_text: string;
  sent_at: string;
  chat_id: number;
}

interface GroupEvent {
  event_id: number;
  event_name: string;
  created_by: number;
  creator_name: string;
  group_id: number;
}

interface GroupMember {
  user_id: number;
  full_name: string;
  bio: string;
  location: string;
  joined_at: string | null;
}

interface GroupDetails {
  group_id: number;
  group_name: string;
  description?: string;
  created_at: string;
  member_count: number;
}

interface GroupViewProps {
  groupId: number;
  onBack?: () => void;
}

const GroupView: React.FC<GroupViewProps> = ({ groupId, onBack }) => {
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  console.log("GroupView rendered with groupId:", groupId);
  
  // Fetch group data on mount and when groupId changes
  useEffect(() => {
    const fetchGroupData = async () => {
      console.log("Fetching data for groupId:", groupId);
      setLoading(true);
      setError(null);
      
      try {
        // Fetch group details first
        let groupInfo: GroupDetails | null = null;
        
        try {
          console.log("Fetching group details from API");
          const groupsResponse = await axios.get(`${API_URL}/groups`);
          console.log("Groups response:", groupsResponse.data);
          
          if (groupsResponse.data) {
            const foundGroup = groupsResponse.data.find((g: any) => g.group_id === groupId);
            console.log("Found group:", foundGroup);
            
            if (foundGroup) {
              groupInfo = {
                group_id: groupId,
                group_name: foundGroup.group_name,
                description: 'Group for discussion and collaboration.',
                created_at: foundGroup.created_at,
                member_count: foundGroup.member_count || 0,
              };
              setGroupDetails(groupInfo);
            } else {
              console.error("Group not found in API response");
              setError("Group not found");
            }
          }
        } catch (err) {
          console.error('Error fetching group details:', err);
          // Fallback to dummy data if we can't get group details
          groupInfo = {
            group_id: groupId,
            group_name: 'Group ' + groupId,
            description: 'This is a group for discussion.',
            created_at: new Date().toISOString(),
            member_count: 0,
          };
          setGroupDetails(groupInfo);
        }
        
        // Only continue fetching other data if we have group details
        if (groupInfo) {
          // Fetch group messages
          try {
            console.log("Fetching messages for group:", groupId);
            const messagesResponse = await axios.get(`${API_URL}/groups/${groupId}/messages`);
            console.log("Messages response:", messagesResponse.data);
            
            if (messagesResponse.data) {
              if (Array.isArray(messagesResponse.data)) {
                setMessages(messagesResponse.data);
              } else {
                console.warn("Messages response is not an array:", messagesResponse.data);
                setMessages([]);
              }
            }
          } catch (err) {
            console.error('Error fetching messages:', err);
            setMessages([]);
          }
          
          // Fetch group events
          try {
            console.log("Fetching events for group:", groupId);
            const eventsResponse = await axios.get(`${API_URL}/groups/${groupId}/events`);
            console.log("Events response:", eventsResponse.data);
            
            if (eventsResponse.data) {
              if (Array.isArray(eventsResponse.data)) {
                setEvents(eventsResponse.data);
              } else {
                console.warn("Events response is not an array:", eventsResponse.data);
                setEvents([]);
              }
            }
          } catch (err) {
            console.error('Error fetching events:', err);
            setEvents([]);
          }
          
          // Fetch group members
          try {
            console.log("Fetching members for group:", groupId);
            const membersResponse = await axios.get(`${API_URL}/groups/${groupId}/members`);
            console.log("Members response:", membersResponse.data);
            
            if (membersResponse.data) {
              if (Array.isArray(membersResponse.data)) {
                setMembers(membersResponse.data);
                
                // Update member count in group details if needed
                if (groupInfo && membersResponse.data.length !== groupInfo.member_count) {
                  setGroupDetails({
                    ...groupInfo,
                    member_count: membersResponse.data.length
                  });
                }
              } else {
                console.warn("Members response is not an array:", membersResponse.data);
                setMembers([]);
              }
            }
          } catch (err) {
            console.error('Error fetching members:', err);
            setMembers([]);
          }
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching group data:', error);
        setError(error.message || "Failed to load group data");
        setLoading(false);
      }
    };
    
    if (groupId) {
      fetchGroupData();
    } else {
      console.error("No groupId provided to GroupView");
      setError("No group ID provided");
      setLoading(false);
    }
  }, [groupId]);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!groupId) return;
    
    setSendingMessage(true);
    setSendError(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.user_id;
    
    try {
      const response = await axios.post(`${API_URL}/groups/${groupId}/messages/send`, {
        user_id: userId,
        message_text: messageText
      });
      
      if (response.data && !response.data.error) {
        // Add new message to the list
        const newMessage: GroupMessage = {
          message_id: response.data.message_id || Math.random(),
          sender_id: userId,
          sender_name: user.username || user.full_name || 'You',
          message_text: messageText,
          sent_at: new Date().toISOString(),
          chat_id: groupId
        };
        
        setMessages([...messages, newMessage]);
        setMessageText('');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Display the exact error message from the backend when status is 400
      if (error.response && error.response.status === 400) {
        setSendError(error.response.data.error || 'Failed to send message');
      } else {
        setSendError('Failed to send message. Please try again.');
      }
    } finally {
      setSendingMessage(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
        <Typography variant="h6" color="error">{error}</Typography>
        {onBack && (
          <Button onClick={onBack} variant="outlined" sx={{ mt: 2 }}>
            Return to Dashboard
          </Button>
        )}
      </Box>
    );
  }
  
  if (!groupId || !groupDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6">No group data available</Typography>
        {onBack && (
          <Button onClick={onBack} variant="outlined" sx={{ ml: 2 }}>
            Return to Dashboard
          </Button>
        )}
      </Box>
    );
  }
  
  return (
    <Box className="group-view-container">
      {/* Group Header */}
      <Paper elevation={0} className="group-header">
        <Box className="group-header-left">
          {onBack && (
            <IconButton onClick={onBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar sx={{ bgcolor: '#915dac', width: 40, height: 40 }}>
            {groupDetails.group_name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{groupDetails.group_name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {groupDetails.member_count} members
              </Typography>
            </Box>
          </Box>
        </Box>
        <Chip 
          label={`Created ${new Date(groupDetails.created_at).toLocaleDateString()}`} 
          size="small" 
          sx={{ bgcolor: '#f0e6f5', color: '#915dac' }}
        />
      </Paper>
      
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Message List */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, height: 'calc(100% - 80px)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
              Messages
            </Typography>
            
            <Box className="message-container">
              <List sx={{ width: '100%' }}>
                {messages.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">No messages yet. Be the first to send one!</Typography>
                  </Box>
                ) : (
                  messages.map((message) => {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const isCurrentUser = message.sender_id === user.user_id;
                    
                    return (
                      <ListItem 
                        key={message.message_id}
                        sx={{ 
                          mb: 1,
                          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start'
                        }}
                      >
                        {!isCurrentUser && (
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#915dac' }}>
                              {message.sender_name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                        )}
                        
                        <Box sx={{ 
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                        }}>
                          {!isCurrentUser && (
                            <Typography variant="subtitle2">
                              {message.sender_name}
                            </Typography>
                          )}
                          
                          <Paper className={`message-bubble ${isCurrentUser ? 'current-user-message' : 'other-user-message'}`}>
                            <Typography variant="body1">
                              {message.message_text}
                            </Typography>
                          </Paper>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(message.sent_at).toLocaleString()}
                          </Typography>
                        </Box>
                        
                        {isCurrentUser && (
                          <ListItemAvatar sx={{ ml: 1 }}>
                            <Avatar sx={{ bgcolor: '#915dac' }}>
                              {message.sender_name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                        )}
                      </ListItem>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </List>
            </Box>
          </Paper>
          
          {/* Message Input */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }} className="message-input">
            {sendError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {sendError}
              </Alert>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                variant="outlined"
                size="small"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sendingMessage}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4
                  }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className="send-button"
              >
                {sendingMessage ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Group Events */}
          <Paper elevation={0} className="events-section">
            <Box className="section-header">
              <EventIcon color="primary" />
              <Typography variant="subtitle1">Upcoming Events</Typography>
            </Box>
            
            {events.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No upcoming events
              </Typography>
            ) : (
              events.map((event) => (
                <Box key={event.event_id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2">{event.event_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created by {event.creator_name}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
          
          {/* Group Members */}
          <Paper elevation={0} className="members-section">
            <Box className="section-header">
              <PeopleIcon color="primary" />
              <Typography variant="subtitle1">Members</Typography>
            </Box>
            
            <List dense sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {members.map((member) => (
                <ListItem key={member.user_id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#915dac' }}>
                      {member.full_name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={member.full_name} 
                    secondary={member.joined_at ? `Joined ${new Date(member.joined_at).toLocaleDateString()}` : 'Recently joined'} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GroupView; 