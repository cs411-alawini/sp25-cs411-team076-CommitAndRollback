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
  CircularProgress
} from '@mui/material';
import { 
  Send as SendIcon, 
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './FriendChat.css';

// Get API URL from config
const API_URL = `${API_BASE_URL}/api`;

interface DirectMessage {
  message_id: number;
  sender_id: number;
  sender_name: string;
  message_text: string;
  sent_at: string;
  chat_id: number;
}

interface FriendDetails {
  user_id: number;
  full_name: string;
  bio: string;
  location: string;
  created_at: string;
  chat_id: number;
  friend_id: number;
}

interface FriendChatProps {
  friendId: number;
  onBack?: () => void;
}

const FriendChat: React.FC<FriendChatProps> = ({ friendId, onBack }) => {
  const [friendDetails, setFriendDetails] = useState<FriendDetails | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  console.log("FriendChat rendered with friendId:", friendId);
  
  // Fetch friend data and messages on mount and when friendId changes
  useEffect(() => {
    const fetchFriendData = async () => {
      console.log("Fetching data for friendId:", friendId);
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.user_id;
      
      if (!currentUserId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }
      
      try {
        // Fetch friend details
        try {
          console.log("Fetching friend details from API");
          const friendsResponse = await axios.get(`${API_URL}/users/${currentUserId}/friends`);
          console.log("Friends response:", friendsResponse.data);
          
          if (friendsResponse.data && Array.isArray(friendsResponse.data)) {
            const foundFriend = friendsResponse.data.find((f: any) => f.friend_id === friendId);
            console.log("Found friend:", foundFriend);
            
            if (foundFriend) {
              setFriendDetails(foundFriend);
            } else {
              console.error("Friend not found in API response");
              setError("Friend not found");
            }
          }
        } catch (err) {
          console.error('Error fetching friend details:', err);
          setError("Failed to fetch friend details");
        }
        
        // Fetch chat messages
        try {
          console.log("Fetching messages for chat between", currentUserId, "and", friendId);
          const messagesResponse = await axios.get(`${API_URL}/users/${currentUserId}/chat/${friendId}/messages`);
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
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching friend data:', error);
        setError(error.message || "Failed to load friend data");
        setLoading(false);
      }
    };
    
    if (friendId) {
      fetchFriendData();
    } else {
      console.error("No friendId provided to FriendChat");
      setError("No friend ID provided");
      setLoading(false);
    }
  }, [friendId]);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !friendId) return;
    
    setSendingMessage(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.user_id;
    
    try {
      const response = await axios.post(`${API_URL}/messages/send`, {
        sender_id: userId,
        receiver_id: friendId,
        message_text: messageText
      });
      
      if (response.data && !response.data.error) {
        // Add new message to the list
        const newMessage: DirectMessage = {
          message_id: response.data.message_id || Math.random(),
          sender_id: userId,
          sender_name: user.full_name || 'You',
          message_text: messageText,
          sent_at: new Date().toISOString(),
          chat_id: response.data.chat_id || 0
        };
        
        setMessages([...messages, newMessage]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
  
  if (!friendId || !friendDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6">No friend data available</Typography>
        {onBack && (
          <Button onClick={onBack} variant="outlined" sx={{ ml: 2 }}>
            Return to Dashboard
          </Button>
        )}
      </Box>
    );
  }
  
  return (
    <Box className="friend-chat-container">
      {/* Friend Header */}
      <Paper elevation={0} className="friend-header">
        <Box className="friend-header-left">
          {onBack && (
            <IconButton onClick={onBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar sx={{ bgcolor: '#ff6b9b', width: 40, height: 40 }}>
            {friendDetails.full_name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{friendDetails.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {friendDetails.location}
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={`Chat ID: ${friendDetails.chat_id}`} 
          size="small" 
          sx={{ bgcolor: '#f0e6f5', color: '#915dac' }}
        />
      </Paper>
      
      <Grid container spacing={0} sx={{ flexGrow: 1 }}>
        {/* Message List */}
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, height: 'calc(100% - 80px)', display: 'flex', flexDirection: 'column' }}>
            <Box className="message-container">
              <List sx={{ width: '100%' }}>
                {messages.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">No messages yet. Start a conversation!</Typography>
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
                            <Avatar sx={{ bgcolor: '#ff6b9b' }}>
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
                            <Avatar sx={{ bgcolor: '#ff6b9b' }}>
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
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }} className="message-input">
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
              disabled={!messageText.trim() || sendingMessage}
              className="send-button"
            >
              {sendingMessage ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FriendChat; 