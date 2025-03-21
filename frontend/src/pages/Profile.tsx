import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Cake,
  Group as GroupIcon,
  Interests as InterestsIcon
} from '@mui/icons-material';
import axios from 'axios';

interface User {
  user_id: number;
  full_name: string;
  gender: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              sx={{ width: 120, height: 120, mb: 2 }}
            >
              {user.full_name[0]}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.bio}
            </Typography>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <ListItemText primary={user.location} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Cake />
              </ListItemIcon>
              <ListItemText primary={`${user.age} years old`} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary={user.gender} />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <InterestsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Interests</Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            {user.interests.map((interest, index) => (
              <Chip
                key={index}
                label={interest}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Profile; 