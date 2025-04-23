import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import axios from 'axios';
import { Group as GroupIcon, Person as PersonIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../config';

interface Group {
  group_id: number;
  group_name: string;
  created_at: string;
  member_count: number;
  interest_id: number;
  is_member?: boolean; // Added to indicate if current user is a member
}

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchGroups();
      return;
    }

    setIsSearching(true);
    try {
      // Get user info from localStorage
      const userInfo = localStorage.getItem('user');
      const userId = userInfo ? JSON.parse(userInfo).user_id : null;
      
      const response = await axios.get(`${API_BASE_URL}/api/groups/search`, {
        params: {
          q: searchTerm,
          user_id: userId
        }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error searching groups:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchGroups();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Groups
      </Typography>
      
      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          disabled={isSearching}
        />
        <Box mt={1} display="flex" justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            Search
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {groups.length > 0 ? (
          groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.group_id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {group.group_name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.member_count} members
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(group.created_at).toLocaleDateString()}
                  </Typography>
                  {group.is_member && (
                    <Box mt={1}>
                      <Chip 
                        label="Member" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  {!group.is_member && (
                    <Button size="small" color="primary">
                      Join Group
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              No groups found
            </Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Groups; 