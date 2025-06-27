import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  ExpandLess,
  BugReport,
  Home
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReportDialog?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  showReportDialog: boolean;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  showDetails: boolean;
  toggleDetails: () => void;
  reportError: () => void;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      showReportDialog: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service
    this.reportToService(error, errorInfo);
  }

  reportToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error tracking service like Sentry
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Mock error reporting - in production, use actual service
      console.log('Error reported:', errorReport);
      
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      showReportDialog: false
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  openReportDialog = () => {
    this.setState({ showReportDialog: true });
  };

  closeReportDialog = () => {
    this.setState({ showReportDialog: false });
  };

  submitErrorReport = (userReport: string) => {
    const { error, errorInfo } = this.state;
    
    const fullReport = {
      userDescription: userReport,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send detailed report
    console.log('User error report submitted:', fullReport);
    
    this.closeReportDialog();
    
    // Show success message (could use toast notification)
    alert('Thank you for your report! Our team will investigate this issue.');
  };

  goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            showDetails={this.state.showDetails}
            toggleDetails={this.toggleDetails}
            reportError={this.openReportDialog}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full card-background">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <ErrorOutline className="text-red-500 text-6xl mb-4" />
                <Typography variant="h4" className="text-white font-bold mb-2">
                  Oops! Something went wrong
                </Typography>
                <Typography variant="body1" className="text-gray-400 mb-6">
                  We encountered an unexpected error. Our team has been notified and is working on a fix.
                </Typography>
              </div>

              <Alert severity="error" className="mb-4">
                <AlertTitle>Error Details</AlertTitle>
                {this.state.error?.message || 'An unknown error occurred'}
              </Alert>

              <div className="flex justify-center space-x-4 mb-6">
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.resetError}
                  className="bg-primary hover:bg-primary/80"
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.goHome}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Go Home
                </Button>

                {this.props.showReportDialog !== false && (
                  <Button
                    variant="outlined"
                    startIcon={<BugReport />}
                    onClick={this.openReportDialog}
                    className="border-orange-600 text-orange-300 hover:bg-orange-700/20"
                  >
                    Report Issue
                  </Button>
                )}
              </div>

              <div className="border-t border-gray-600 pt-4">
                <Button
                  onClick={this.toggleDetails}
                  endIcon={this.state.showDetails ? <ExpandLess /> : <ExpandMore />}
                  className="text-gray-400 hover:text-white"
                >
                  Technical Details
                </Button>
                
                <Collapse in={this.state.showDetails}>
                  <Box className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <Typography variant="subtitle2" className="text-white mb-2">
                      Error Message:
                    </Typography>
                    <Typography variant="body2" className="text-red-300 mb-4 font-mono">
                      {this.state.error?.message}
                    </Typography>
                    
                    {this.state.error?.stack && (
                      <>
                        <Typography variant="subtitle2" className="text-white mb-2">
                          Stack Trace:
                        </Typography>
                        <Typography variant="body2" className="text-gray-300 font-mono text-xs whitespace-pre-wrap mb-4">
                          {this.state.error.stack}
                        </Typography>
                      </>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <Typography variant="subtitle2" className="text-white mb-2">
                          Component Stack:
                        </Typography>
                        <Typography variant="body2" className="text-gray-300 font-mono text-xs whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Collapse>
              </div>
            </CardContent>
          </Card>

          {/* Error Report Dialog */}
          <ErrorReportDialog
            open={this.state.showReportDialog}
            onClose={this.closeReportDialog}
            onSubmit={this.submitErrorReport}
            error={this.state.error}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Report Dialog Component
interface ErrorReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (report: string) => void;
  error: Error | null;
}

const ErrorReportDialog: React.FC<ErrorReportDialogProps> = ({
  open,
  onClose,
  onSubmit,
  error
}) => {
  const [userReport, setUserReport] = React.useState('');

  const handleSubmit = () => {
    onSubmit(userReport);
    setUserReport('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-secondary text-white">
        Report Error
      </DialogTitle>
      <DialogContent className="bg-secondary">
        <Typography variant="body2" className="text-gray-400 mb-4">
          Help us improve by describing what you were doing when this error occurred.
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Please describe what you were doing when the error occurred..."
          value={userReport}
          onChange={(e) => setUserReport(e.target.value)}
          className="mb-4"
          variant="outlined"
        />
        
        <Alert severity="info" className="mb-4">
          <AlertTitle>Error Information</AlertTitle>
          <Typography variant="body2">
            <strong>Error:</strong> {error?.message || 'Unknown error'}
          </Typography>
          <Typography variant="body2">
            <strong>Time:</strong> {new Date().toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <strong>Page:</strong> {window.location.pathname}
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions className="bg-secondary">
        <Button onClick={onClose} className="text-gray-400">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!userReport.trim()}
          className="bg-primary hover:bg-primary/80"
        >
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Custom Error Fallback Components
export const MinimalErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError
}) => (
  <div className="text-center p-8">
    <ErrorOutline className="text-red-500 text-4xl mb-4" />
    <Typography variant="h6" className="text-white mb-2">
      Something went wrong
    </Typography>
    <Typography variant="body2" className="text-gray-400 mb-4">
      {error?.message || 'An unexpected error occurred'}
    </Typography>
    <Button
      variant="contained"
      onClick={resetError}
      className="bg-primary hover:bg-primary/80"
    >
      Try Again
    </Button>
  </div>
);

export const InlineErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError
}) => (
  <Alert 
    severity="error" 
    action={
      <Button color="inherit" size="small" onClick={resetError}>
        Retry
      </Button>
    }
  >
    <AlertTitle>Error</AlertTitle>
    {error?.message || 'Component failed to render'}
  </Alert>
);

// Higher-order component for easy error boundary wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;