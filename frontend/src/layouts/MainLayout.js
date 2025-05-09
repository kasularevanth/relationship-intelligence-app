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
        bgcolor: darkMode ? 'background.paper' : undefined 
      }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Relationship AI
        </Typography>
      </Box>
      <Divider />
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
      <AppBar position="static">
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Relationship Intelligence
          </Typography>
          
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
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
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