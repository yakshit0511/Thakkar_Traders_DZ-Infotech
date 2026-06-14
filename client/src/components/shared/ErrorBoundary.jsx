import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F0EBE1',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
          }}
        >
          {/* Gold top bar */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #C4892E, transparent)',
            }}
          />

          {/* Watermark number */}
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(6rem, 18vw, 14rem)',
              fontWeight: 300,
              lineHeight: 1,
              color: 'rgba(196,137,46,0.08)',
              userSelect: 'none',
              position: 'absolute',
              pointerEvents: 'none',
            }}
          >
            500
          </p>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
            {/* Label */}
            <p
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                color: '#C4892E',
                marginBottom: '1.5rem',
              }}
            >
              UNEXPECTED ERROR
            </p>

            {/* Gold divider */}
            <div style={{ height: '1px', width: '40px', background: '#C4892E', margin: '0 auto 1.5rem' }} />

            <h1
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 300,
                color: '#1A1714',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
              }}
            >
              Something went{' '}
              <span style={{ fontStyle: 'italic', color: '#C4892E' }}>wrong</span>.
            </h1>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 300,
                color: '#5A5450',
                lineHeight: 1.8,
                marginBottom: '2.5rem',
              }}
            >
              An unexpected error has occurred. Our team has been notified.
              Please try refreshing or return to the homepage.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#C4892E',
                  color: '#fff',
                  border: 'none',
                  padding: '0.875rem 2.5rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.background = '#A8602A')}
                onMouseOut={(e) => (e.target.style.background = '#C4892E')}
              >
                RELOAD PAGE
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  background: 'transparent',
                  color: '#1A1714',
                  border: '1px solid rgba(26,23,20,0.3)',
                  padding: '0.875rem 2.5rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#C4892E';
                  e.target.style.color = '#C4892E';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = 'rgba(26,23,20,0.3)';
                  e.target.style.color = '#1A1714';
                }}
              >
                GO HOME
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
