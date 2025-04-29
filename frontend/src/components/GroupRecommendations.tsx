import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { People } from '@mui/icons-material';
import { Group } from '../types';

interface GroupRecommendationsProps {
  userId?: number;
  showRecommendedOnly?: boolean;
  showActiveOnly?: boolean;
  groups: Group[];
  onJoinGroup: (groupId: number) => void;
}

const GroupRecommendations: React.FC<GroupRecommendationsProps> = ({ 
  userId, 
  showRecommendedOnly = false, 
  showActiveOnly = false,
  groups,
  onJoinGroup,
}) => {
  if (showRecommendedOnly) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Recommended Groups
        </Typography>
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.group_id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <People sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {group.group_name}
                    </Typography>
                  </Box>
                  {!group.is_member ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onJoinGroup(group.group_id)}
                    >
                      Join Group
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      You are already a member
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (showActiveOnly) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Active Groups
        </Typography>
        <Grid container spacing={3}>
          {groups
            .filter(group => group.member_count > 0)
            .map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.group_id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <People sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {group.group_name}
                      </Typography>
                    </Box>
                    {!group.is_member ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onJoinGroup(group.group_id)}
                      >
                        Join Group
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        You are already a member
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    );
  }

  return null;
};

export default GroupRecommendations; 