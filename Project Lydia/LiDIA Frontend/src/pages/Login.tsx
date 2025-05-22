import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { supabase } from '../main'; // or your supabase client path
import lidiaLogo from '../assets/lidiaLogo.png';
import googleLogo from "../assets/googleLogo.png";

// --- Supabase Client Setup ---
// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// It's best practice to put this in a separate file (e.g., src/supabaseClient.ts)
// and import it where needed.
// For the main LIDIA logo
const LOGO_URL: string = lidiaLogo;
const GOOGLE_ICON_SVG_DATA_URI: string = googleLogo;

// Interface for the styles object
interface ComponentStyles {
  loginContainer: CSSProperties;
  waveBase: CSSProperties;
  waveDark: CSSProperties;
  waveMid: CSSProperties;
  contentWrapper: CSSProperties;
  logo: CSSProperties;
  welcomeTitle: CSSProperties;
  subtitle: CSSProperties;
  formTitle: CSSProperties;
  inputField: CSSProperties;
  button: CSSProperties;
  primaryButton: CSSProperties;
  primaryButtonHover: CSSProperties;
  divider: CSSProperties;
  dividerLine: CSSProperties;
  dividerText: CSSProperties;
  googleButton: CSSProperties;
  googleButtonHover: CSSProperties;
  googleIcon: CSSProperties;
  legalText: CSSProperties;
  legalLink: CSSProperties;
  legalLinkHover: CSSProperties;
  messageText: CSSProperties; // For error/success messages
  loadingSpinner?: CSSProperties; // Optional: for a spinner
}

const Login: React.FC = () => {

  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get location state (for redirect after login)

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isPrimaryButtonHovered, setIsPrimaryButtonHovered] = useState<boolean>(false);
  const [isGoogleButtonHovered, setIsGoogleButtonHovered] = useState<boolean>(false);
  const [isTermsLinkHovered, setIsTermsLinkHovered] = useState<boolean>(false);
  const [isPrivacyLinkHovered, setIsPrivacyLinkHovered] = useState<boolean>(false);

  // Redirect if user is already logged in or after successful login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        // Redirect to the questionnaire page or dashboard
        // In a real app, use react-router-dom: navigate('/questionnaire');
        const from = location.state?.from || '/questionnaire'; // Get intended path or default
        navigate(from, { replace: true }); // Navigate to the intended path
      } else if (event === 'SIGNED_OUT') {
        // Handle sign out if needed
        console.log('User signed out');
      }
    });

    // Check initial session
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('Existing session found:', session.user);
            window.location.href = '/questionnaire'; // Or your main app page
        }
    };
    checkSession();


    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, location.state]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    document.body.style.backgroundColor = '#1a0d4a';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100%';
    }

    return () => {
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      if (rootElement) {
        rootElement.style.height = '';
      }
    };
  }, []);

  const handleEmailSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!email) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
    }

    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // emailRedirectTo: `${window.location.origin}/questionnaire`, // Or your desired redirect path
        // This will be the page the user is redirected to after clicking the magic link.
        // Ensure this URL is added to your Supabase project's "Redirect URLs"
      },
    });

    if (signUpError) {
      setError(`Error: ${signUpError.message}`);
      console.error('Error signing up with email:', signUpError);
    } else {
      setMessage('Check your email for the login link!');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // redirectTo: `${window.location.origin}/questionnaire`,
        // Ensure this URL is added to your Supabase project's "Redirect URLs"
      },
    });

    if (googleError) {
      setError(`Error: ${googleError.message}`);
      console.error('Error signing in with Google:', googleError);
      setLoading(false);
    }
    // If successful, Supabase redirects to Google, then back to your app.
    // The onAuthStateChange listener will handle the session.
  };


  const styles: ComponentStyles = {
    loginContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#6a1b9a',
    },
    waveBase: {
      position: 'absolute',
      left: '50%',
      width: '200%',
      zIndex: 1,
      borderBottomLeftRadius: '50% 100px',
      borderBottomRightRadius: '50% 100px',
    },
    waveDark: {
      backgroundColor: '#1a0d4a',
      top: '-35%',
      height: '75%',
      transform: 'translateX(-50%) rotate(-4deg)',
      zIndex: 1,
    },
    waveMid: {
      backgroundColor: '#4a1f74',
      top: '-25%',
      height: '70%',
      transform: 'translateX(-50%) rotate(3deg)',
      zIndex: 2,
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      color: '#fff',
      maxWidth: '380px',
      width: '100%',
      padding: '30px',
      boxSizing: 'border-box',
    },
    logo: {
      width: '100px',
      height: 'auto',
      marginBottom: '20px',
      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
    },
    welcomeTitle: {
      fontSize: '2.2rem',
      fontWeight: 'bold',
      margin: '0 0 5px 0',
      color: '#ffffff',
      textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
    },
    subtitle: {
      fontSize: '1rem',
      margin: '0 0 30px 0',
      color: '#e0c6f5',
    },
    formTitle: {
      fontSize: '1.1rem',
      fontWeight: 600,
      margin: '0 0 15px 0',
      color: '#ffffff',
    },
    inputField: {
      width: '100%',
      padding: '12px 15px',
      marginBottom: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '1rem',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      color: '#333',
    },
    button: {
      width: '100%',
      padding: '12px 15px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.1s ease',
      boxSizing: 'border-box',
      opacity: loading ? 0.7 : 1, // Dim button when loading
    },
    primaryButton: {
      backgroundColor: '#0c0a2c',
      color: 'white',
      marginBottom: '20px',
    },
    primaryButtonHover: {
      backgroundColor: '#1e1c4a',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      margin: '15px 0',
    },
    dividerLine: {
      flexGrow: 1,
      height: '1px',
      backgroundColor: '#8a69a0',
    },
    dividerText: {
      padding: '0 15px',
      fontSize: '0.9rem',
      color: '#d0b3e5',
    },
    googleButton: {
      backgroundColor: '#f0f0f0',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '25px',
    },
    googleButtonHover: {
      backgroundColor: '#e0e0e0',
    },
    googleIcon: {
      width: '20px',
      height: '20px',
    },
    legalText: {
      fontSize: '0.8rem',
      color: '#e0c6f5',
      lineHeight: 1.5,
    },
    legalLink: {
      color: '#ffffff',
      textDecoration: 'underline',
      fontWeight: 500,
      cursor: 'pointer',
    },
    legalLinkHover: {
      textDecoration: 'none',
    },
    messageText: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      textAlign: 'center',
      fontSize: '0.9rem',
    },
  };

  const handleButtonInteraction = (
    event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
    action: 'down' | 'up'
  ) => {
    if (loading) return; // Don't allow interaction if loading
    const target = event.currentTarget as HTMLButtonElement;
    target.style.transform = action === 'down' ? 'scale(0.98)' : 'scale(1)';
  };

  return (
    <div style={styles.loginContainer}>
      <div style={{ ...styles.waveBase, ...styles.waveDark }}></div>
      <div style={{ ...styles.waveBase, ...styles.waveMid }}></div>

      <div style={styles.contentWrapper}>
        <img src={LOGO_URL} alt="LIDIA Logo" style={styles.logo} />
        <h1 style={styles.welcomeTitle}>Welcome To LIDIA</h1>
        <p style={styles.subtitle}>Your smart personal assistant</p>

        <h2 style={styles.formTitle}>Create an account or Sign in</h2>

        {message && (
          <p style={{ ...styles.messageText, backgroundColor: '#d4edda', color: '#155724' }}>
            {message}
          </p>
        )}
        {error && (
          <p style={{ ...styles.messageText, backgroundColor: '#f8d7da', color: '#721c24' }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.inputField}
          disabled={loading}
        />
        <button
          style={{
            ...styles.button,
            ...styles.primaryButton,
            ...(isPrimaryButtonHovered && !loading && styles.primaryButtonHover),
          }}
          onMouseEnter={() => setIsPrimaryButtonHovered(true)}
          onMouseLeave={() => setIsPrimaryButtonHovered(false)}
          onMouseDown={(e) => handleButtonInteraction(e, 'down')}
          onMouseUp={(e) => handleButtonInteraction(e, 'up')}
          onTouchStart={(e) => handleButtonInteraction(e, 'down')}
          onTouchEnd={(e) => handleButtonInteraction(e, 'up')}
          onClick={handleEmailSignUp}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Continue with Email'}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine}></span>
        </div>

        <button
          style={{
            ...styles.button,
            ...styles.googleButton,
            ...(isGoogleButtonHovered && !loading && styles.googleButtonHover),
          }}
          onMouseEnter={() => setIsGoogleButtonHovered(true)}
          onMouseLeave={() => setIsGoogleButtonHovered(false)}
          onMouseDown={(e) => handleButtonInteraction(e, 'down')}
          onMouseUp={(e) => handleButtonInteraction(e, 'up')}
          onTouchStart={(e) => handleButtonInteraction(e, 'down')}
          onTouchEnd={(e) => handleButtonInteraction(e, 'up')}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img src={GOOGLE_ICON_SVG_DATA_URI} alt="Google" style={styles.googleIcon} />
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <p style={styles.legalText}>
          By clicking continue, you agree to our{' '}
          <a
            href="/terms" // Replace with your actual terms link
            style={{
              ...styles.legalLink,
              ...(isTermsLinkHovered && styles.legalLinkHover),
            }}
            onMouseEnter={() => setIsTermsLinkHovered(true)}
            onMouseLeave={() => setIsPrivacyLinkHovered(false)} // Corrected: was setIsPrivacyLinkHovered(false)
            target="_blank" rel="noopener noreferrer"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy" // Replace with your actual privacy link
            style={{
              ...styles.legalLink,
              ...(isPrivacyLinkHovered && styles.legalLinkHover),
            }}
            onMouseEnter={() => setIsPrivacyLinkHovered(true)}
            onMouseLeave={() => setIsPrivacyLinkHovered(false)}
            target="_blank" rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;