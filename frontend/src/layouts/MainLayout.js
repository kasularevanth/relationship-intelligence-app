// frontend/src/layouts/MainLayout.js
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Container,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import SoulSyncLogo from '../components/SoulSyncLogo';

const drawerWidth = 240;

// Styled component for the profile section in AppBar
const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: theme.spacing(1),
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  borderRadius: 30,
  transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #321b4a 0%, #241138 100%)',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
}));

const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
    
   // Get user display name and photo URL from API response
   const userDisplayName = currentUser?.name || 
   (currentUser?.email ? currentUser.email.split('@')[0] : 'User');
 const userPhotoURL = currentUser?.avatar || null;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      handleProfileMenuClose();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', protected: true },
    { text: 'Add Relationship', icon: <PersonAddIcon />, path: '/new-relationship', protected: true },
  ];

  const drawer = (
    <div>
     <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: darkMode ? 'background.paper' : undefined,
                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}>
                <SoulSyncLogo size="small" withText textSize="small" />
              </Box>
      <List>
        {menuItems.map((item) => (
          (!item.protected || currentUser) && (
            <ListItem 
              button 
              key={item.text} 
              component={RouterLink} 
              to={item.path}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
      </List>
      <Divider />
      {currentUser ? (
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        </List>
      )}
    </div>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: darkMode ? 'background.default' : undefined,
      color: darkMode ? 'text.primary' : undefined
    }}>
      <AppBarStyled position="static" elevation={0}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"        
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
                    {/* Logo and App Name */}
                    <Box 
                      component={RouterLink} 
                      to="/"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        flexGrow: 1 
                      }}
                    >
                      <SoulSyncLogo size="xsmall" withText={false} />
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                          ml: 1,
                          fontWeight: 700,
                          background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          letterSpacing: '0.5px',
                          display: { xs: 'none', sm: 'block' },
                          fontSize: '1.5rem'
                        }}
                      >
            SoulSync
          </Typography>
        </Box>
          
          {/* Settings icon (Theme Toggle) */}
                    <IconButton 
                      color="inherit" 
                      sx={{ mr: 1 }}
                    >
                      <ThemeToggle />
                    </IconButton>
                    
                    {currentUser ? (
            <>
              {/* Profile Section - Avatar and Name in Navbar */}
              <ProfileSection onClick={handleProfileMenuOpen}>
                <Avatar 
                  src={userPhotoURL} 
                  alt={userDisplayName}
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    mr: { xs: 0, sm: 1 }
                  }}
                >
                  {!userPhotoURL && userDisplayName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' } 
                  }}
                >
                  {userDisplayName}
                </Typography>
              </ProfileSection>
              
              {/* Profile Menu */}
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 120,
                    borderRadius: 2,
                    mt: 0.5,
                    boxShadow: '0px 5px 15px rgba(0,0,0,0.15)',
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    py: 1.5,
                    justifyContent: 'center',
                    fontWeight: 500
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              variant="contained"
              component={RouterLink} 
              to="/login"
              sx={{
                borderRadius: 28,
                px: 2,
                py: 0.75,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(90deg, #ff6b8b 0%, #33d2c3 100%)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #ff5c7f 0%, #2bc0b2 100%)',
                }
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBarStyled>
      
            {/* Add the Drawer component */}
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  bgcolor: darkMode ? 'background.paper' : undefined,
                  color: darkMode ? 'text.primary' : undefined
                },
              }}
              variant="temporary"
              anchor="left"
              open={drawerOpen}
              onClose={handleDrawerToggle}
            >
              {drawer}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, bgcolor: darkMode ? 'background.default' : undefined }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;