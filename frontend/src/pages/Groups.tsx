import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  People
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import GroupRecommendations from '../components/GroupRecommendations';
import { Group } from '../types';
import { API_BASE_URL } from '../config';

const Groups: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [recommendedGroups, setRecommendedGroups] = useState<Group[]>([]);
  const [activeGroups, setActiveGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      fetchGroups();
    }
  }, [currentUser?.id]);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [recommendedResponse, activeResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users/${currentUser?.id}/recommended-groups`),
        axios.get(`${API_BASE_URL}/api/users/${currentUser?.id}/active-groups`)
      ]);
      setRecommendedGroups(recommendedResponse.data);
      setActiveGroups(activeResponse.data);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredGroups = activeTab === 0 ? recommendedGroups : activeGroups;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Recommended Groups" />
        <Tab label="Active Groups" />
      </Tabs>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredGroups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {group.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {group.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <People fontSize="small" />
                    <Typography variant="body2">
                      {group.member_count} members
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {group.interests?.map((interest: string) => (
                      <Chip key={interest} label={interest} size="small" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Join Group
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Groups; 