import { Typography, Grid, Paper, Box } from '@mui/material';
import { Group as GroupIcon, Person as PersonIcon, Event as EventIcon } from '@mui/icons-material';

const Home = () => {
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Welcome to Synapo
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Connect with people who share your interests and join engaging groups.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <PersonIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h4" gutterBottom>
                500+
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Active Users
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <GroupIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h4" gutterBottom>
                50+
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Active Groups
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <EventIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h4" gutterBottom>
                100+
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Events This Month
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <Typography paragraph>
          1. Browse through our user recommendations to find people with similar interests
        </Typography>
        <Typography paragraph>
          2. Join groups that match your hobbies and passions
        </Typography>
        <Typography paragraph>
          3. Participate in events and start making meaningful connections
        </Typography>
      </Box>
    </div>
  );
};

export default Home; 