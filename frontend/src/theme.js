// Updated theme.js with fixes for mobile dark mode - with targeted styles
import { createTheme } from '@mui/material/styles';

export const getTheme = (darkMode) => {
  // First create the base theme
  const baseTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#4aeabc' : '#3f51b5', // Use accent color in dark mode
        light: darkMode ? '#6573c7' : '#757de8',
        dark: darkMode ? '#2c3a8c' : '#002984',
      },
      secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5', // Normal dark background for most pages
        paper: darkMode ? '#1e1e1e' : '#ffffff',   // Normal paper color for most pages
      },
      text: {
        primary: darkMode ? '#ffffff' : '#212121',
        secondary: darkMode ? '#b0b0b0' : '#757575',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 500 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: darkMode ? '#121212' : '#f5f5f5',
            color: darkMode ? '#ffffff' : '#212121',
            // Auth page specific body styling
            '&[data-page-type="auth"]': {
              backgroundColor: darkMode ? '#000000' : '#f5f5f5',
            },
            '&.dark-mode-auth': {
              backgroundColor: '#000000',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            backgroundImage: 'none',
            padding : '0px',
            borderRadius:'none'
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            backgroundImage: 'none',
            // Add media query for mobile auth pages
            '@media (max-width: 600px)': {
              'body[data-page-type="auth"] &': {
                backgroundColor: '#000000 !important',
                backgroundImage: 'none !important',
              },
              'body.dark-mode-auth &': {
                backgroundColor: '#000000 !important',
                backgroundImage: 'none !important',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            padding: '10px 24px',
            boxShadow: darkMode ? '0 4px 10px rgba(0, 0, 0, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode ? '0 6px 12px rgba(0, 0, 0, 0.4)' : '0 6px 12px rgba(0, 0, 0, 0.15)',
            },
            '&.MuiButton-outlined': {
              border: darkMode ? '1px solid #4aeabc' : undefined,
            },
            '&.MuiButton-outlined svg[class*="GoogleIcon"]': {
              color: '#4285F4',
            },
          },
          containedPrimary: {
            backgroundColor: darkMode ? '#4aeabc' : undefined,
            color: darkMode ? '#000000' : undefined,
            '&:hover': {
              backgroundColor: darkMode ? '#3dd9aa' : undefined,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: darkMode ? 
              'linear-gradient(90deg, #303f9f 0%, #3f51b5 100%)' : 
              'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: darkMode ? '2px solid rgba(255, 255, 255, 0.1)' : 'none',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : undefined,
            '& fieldset': {
              borderColor: darkMode ? '#333333' : undefined,
            },
            '&:hover fieldset': {
              borderColor: darkMode ? '#4aeabc' : undefined,
            },
            '&.Mui-focused fieldset': {
              borderColor: darkMode ? '#4aeabc' : undefined,
            },
          },
        },
      },
    },
  });

  // Create a new theme with additional styles
  return createTheme(baseTheme, {
    components: {
      // Add global styles that apply only to auth pages
      MuiCssBaseline: {
        styleOverrides: `
          @media (max-width: 600px) {
            .auth-page .MuiPaper-root {
              background-color: ${darkMode ? '#000000' : '#ffffff'} !important;
              border-radius: 0 !important;
              padding: 0 !important;
            }
            
            .auth-page .MuiBox-root {
              background-color: ${darkMode ? '#000000' : undefined} !important;
            }
            
            .auth-page .MuiContainer-root {
              background-color: ${darkMode ? '#000000' : undefined} !important;
            }
          }
        `,
      },
    },
  });
};

// For the light theme - keeping it as is
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.07)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});