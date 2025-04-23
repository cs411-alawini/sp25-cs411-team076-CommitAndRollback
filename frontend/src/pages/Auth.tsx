import { useState, useEffect } from 'react';
import { Box, Button, Container, TextField, Typography, Link, Grid, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const locationPath = useLocation();

  // Add debugging for navigation
  useEffect(() => {
    console.log('Auth component mounted, current path:', locationPath.pathname);
  }, [locationPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log(`Attempting to ${isLogin ? 'login' : 'signup'} with username: ${username}`);
      
      if (isLogin) {
        // Real login with backend API
        const response = await axios.post(`${API_URL}/login`, { 
          username: username, 
          password: password 
        });
        
        console.log('Login response:', response.data);
        
        if (response.data && response.data.success) {
          // Store user information
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Navigate directly to dashboard
          console.log('Login successful, navigating to dashboard');
          navigate('/dashboard');
        } else {
          throw new Error(response.data.message || 'Invalid login credentials');
        }
      } else {
        // Validate required fields
        if (!username || !password) {
          throw new Error('Username and password are required');
        }

        // Real signup with backend API
        const userData = {
          full_name: username,
          password: password,
          age: age ? parseInt(age) : null,
          location: location || null,
          gender: gender || null,
          bio: bio || null
        };

        const response = await axios.post(`${API_URL}/signup`, userData);
        
        console.log('Signup response:', response.data);
        
        if (response.data && response.data.success) {
          // After successful signup, log the user in automatically
          const loginResponse = await axios.post(`${API_URL}/login`, { 
            username: username, 
            password: password 
          });
          
          if (loginResponse.data && loginResponse.data.success) {
            // Store user information
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
            
            // Set flag indicating this is a new signup
            localStorage.setItem('newSignup', 'true');
            
            // Navigate to interests selection page instead of dashboard
            console.log('Signup and login successful, navigating to interests selection');
            navigate('/interests-selection');
          } else {
            // If automatic login fails, redirect to login page
            setIsLogin(true);
            setError('Account created successfully. Please log in.');
          }
        } else {
          throw new Error(response.data.message || 'Error creating account');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Display the exact error message from the backend when status is 400
      if (error.response && error.response.status === 400) {
        setError(error.response.data.error || error.response.data.message || 'Invalid request. Please check your information.');
      } else {
        setError(error.response?.data?.message || error.message || 'An error occurred during authentication. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        bgcolor: '#f9f9f9'
      }}
    >
      <Grid container sx={{ height: '100%' }}>
        <Grid 
          item 
          xs={12} 
          md={7} 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box 
            component="img" 
            src="/img/signup.svg" 
            alt="Sign up illustration" 
            sx={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }} 
          />
        </Grid>
        
        <Grid 
          item 
          xs={12} 
          md={5}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            maxHeight: '100vh',
            overflow: 'auto'
          }}
        >
          <Box 
            component="img" 
            src="/img/logo.svg" 
            alt="Synapo Logo" 
            sx={{ 
              width: { xs: 150, sm: 180 }, 
              mb: 4
            }} 
          />
          
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              mb: 3,
              fontWeight: 600 
            }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Typography>
          
          {error && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Full Name"
              name="username"
              autoComplete="name"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              helperText={isLogin ? "Enter your full name" : "Enter your full name (required)"}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={isLogin ? "Enter your password" : "Create a password (required)"}
            />
            
            {!isLogin && (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  id="age"
                  label="Age"
                  name="age"
                  type="number"
                  inputProps={{ min: 13, max: 120 }}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  helperText="Your age (optional)"
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="location"
                  label="Location"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  helperText="Your location (optional)"
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    value={gender}
                    label="Gender"
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <MenuItem value="">Select gender</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  helperText="Tell us about yourself (optional)"
                />
              </>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{ 
                mt: 3, 
                mb: 2, 
                bgcolor: '#ff6b9b', 
                color: 'white',
                fontWeight: 600,
                height: 48,
                borderRadius: 24,
                textTransform: 'none',
                '&:hover': { 
                  bgcolor: '#ff4983' 
                } 
              }}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                {isLogin && (
                  <Link 
                    href="#" 
                    variant="body2"
                    sx={{ 
                      color: '#ff6b9b',
                      fontWeight: 500,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                )}
              </Grid>
              <Grid item>
                <Link 
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{ 
                    color: '#ff6b9b',
                    fontWeight: 500,
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Auth; 