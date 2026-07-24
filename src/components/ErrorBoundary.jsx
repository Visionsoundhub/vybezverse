import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
    
    // Check if it's a chunk loading error
    const isChunkLoadFailed = error?.name === 'ChunkLoadError' || 
                              error?.message?.includes('Failed to fetch dynamically imported module');
    
    if (isChunkLoadFailed) {
      // Force a hard reload from the server to get the new chunk hashes
      window.location.reload(true);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#E0902F', background: '#16110F', fontFamily: 'var(--font-mono)' }}>
          <h2>Oops, κάτι πήγε στραβά!</h2>
          <p>Γίνεται ανανέωση της σελίδας για να πάρετε την τελευταία έκδοση...</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#7C2B25', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Χειροκίνητη Ανανέωση
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
