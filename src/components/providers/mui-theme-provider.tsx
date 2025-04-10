'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4318FF',
      dark: '#3311DB',
      light: '#6A4FFF',
    },
    secondary: {
      main: '#0F1535',
      light: '#2B3674',
    },
    background: {
      default: '#0B1437',
      paper: '#111C44',
    },
    success: {
      main: '#01B574',
      light: '#32CD32',
    },
    info: {
      main: '#3965FF',
      light: '#3965FF80',
    },
    warning: {
      main: '#FFB547',
      light: '#FFB54780',
    },
    error: {
      main: '#FF5B5B',
      light: '#FF5B5B80',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
      },
    },
  },
  typography: {
    fontFamily: 'var(--font-inter)',
  },
});

export function MUIThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
} 