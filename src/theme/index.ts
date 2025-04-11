import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    darkBlue: Palette['primary'];
    customGradient: string;
  }
  interface PaletteOptions {
    darkBlue?: PaletteOptions['primary'];
    customGradient?: string;
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0075FF',
      light: '#339DFF',
      dark: '#0052B2',
    },
    secondary: {
      main: '#0B1437',
      light: '#1B2B65',
      dark: '#070C24',
    },
    background: {
      default: '#0B1437',
      paper: '#111C44',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    customGradient: 'linear-gradient(135deg, #111C44 0%, rgb(8, 17, 53) 100%)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(17, 28, 68, 0.3)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundImage: 'none'
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(17, 28, 68, 0.2) !important',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(17, 28, 68, 0.7) !important',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(17, 28, 68, 0.7)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: '#171d3f!important',
            '&:hover': {
              backgroundColor: '#0052B2',
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(17, 28, 68, 0.75)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(17, 28, 68, 0.75)',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: 'none',
            borderRight: 'none',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 6px',
          padding: '8px 12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  },
});

export default theme; 