import { useState, useEffect } from 'react';
import { Box, Button, Container, TextField, Typography, Link, Grid, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Add debugging for navigation
  useEffect(() => {
    console.log('Auth component mounted, current path:', location.pathname);
  }, [location]);

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
        // Real signup with backend API
        const response = await axios.post(`${API_URL}/auth/signup`, { 
          full_name: username,
          first_name: firstName,
          last_name: lastName,
          password: password 
        });
        
        console.log('Signup response:', response.data);
        
        if (response.data && response.data.user) {
          // Store user information
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Navigate directly to dashboard
          console.log('Signup successful, navigating to dashboard');
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response format from server');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred during authentication. Please try again.');
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
            {!isLogin ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </>
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                helperText="Type in your full name "
              />
            )}
            
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
              helperText={isLogin ? "Type in your password" : ""}
            />
            
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
              {isLogin ? 'Login' : 'SignUp'}
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