import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface UserRecommendation {
  recommended_user_id: number;
  recommended_user_name: string;
  common_interests: number;
  age_difference: number;
}

const Users = () => {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const currentUserId = 1; // This would normally come from authentication

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${currentUserId}/recommendations`);
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, [currentUserId]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Recommended Users
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {recommendations.map((recommendation, index) => (
                  <div key={recommendation.recommended_user_id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{recommendation.recommended_user_name[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={recommendation.recommended_user_name}
                        secondary={
                          <>
                            {`${recommendation.common_interests} common interests • `}
                            {`Age difference: ${recommendation.age_difference} years`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recommendations.length - 1 && <Divider variant="inset" component="li" />}
                  </div>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Users; 