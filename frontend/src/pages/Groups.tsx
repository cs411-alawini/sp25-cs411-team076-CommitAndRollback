import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box
} from '@mui/material';
import axios from 'axios';
import { Group as GroupIcon, Person as PersonIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../config';

interface Group {
  group_id: number;
  group_name: string;
  created_at: string;
  member_count: number;
  interest_id: number;
}

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/groups`);
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Groups
      </Typography>
      <Grid container spacing={3}>
        {groups.map((group) => (
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
              </CardContent>
              <CardActions>
                <Button size="small">View Details</Button>
                <Button size="small" color="primary">
                  Join Group
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Groups; 