import React, { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../main';
import type { User } from '@supabase/supabase-js';
import lidiaLogo from '../assets/lidiaLogo.png';
import microsoftLogo from "../assets/Microsoft_icon.svg";

// --- Supabase Client Setup ---
const LOGO_URL: string = lidiaLogo;
const AZURE_ICON_SVG_DATA_URI: string = microsoftLogo;

// Interface for the styles object (keep as is)
interface ComponentStyles {
  loginContainer: CSSProperties;
  waveBase: CSSProperties;
  waveDark: CSSProperties;
  waveMid: CSSProperties;
  contentWrapper: CSSProperties;
  logo: CSSProperties;
  welcomeTitle: CSSProperties;
  subtitle: CSSProperties;
  button: CSSProperties;
  azureButton: CSSProperties;
  azureButtonHover: CSSProperties;
  azureIcon: CSSProperties;
  legalText: CSSProperties;
  legalLink: CSSProperties;
  legalLinkHover: CSSProperties;
  messageText: CSSProperties;
  loadingSpinner?: CSSProperties;
}

const Login: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(true); // Start loading true to check session
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isAzureButtonHovered, setIsAzureButtonHovered] = useState<boolean>(false);
  const [isTermsLinkHovered, setIsTermsLinkHovered] = useState<boolean>(false);
  const [isPrivacyLinkHovered, setIsPrivacyLinkHovered] = useState<boolean>(false);

  const isProcessingSession = useRef(false);

  useEffect(() => {
    console.log(`LOGIN PAGE LOADED. Path: ${location.pathname}, State: ${JSON.stringify(location.state)}, Initial loading: ${loading}`);

    const processUserSession = async (user: User, eventType: 'INITIAL_SESSION' | 'SIGNED_IN') => {
      if (isProcessingSession.current) {
        console.log("Already processing session, skipping redundant call.");
        return;
      }
      isProcessingSession.current = true;
      console.log(`processUserSession called for event: ${eventType}, user ID: ${user.id}`);
      setLoading(true); // Ensure loading is true while processing

      setError('');
      setMessage('');

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, lidia_instructions, work_scope')
          .eq('id', user.id)
          .single();

        console.log('Fetched profile:', profile);

        let questionnaireComplete = false;

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          if (profileError.code === 'PGRST116') { // No rows found, profile doesn't exist for this user
             console.log('Profile does not exist for this user. Redirecting to questionnaire.');
             // questionnaireComplete remains false
          } else {
            setError('Could not verify your profile. Please try logging in again or contact support.');
            setLoading(false);
            isProcessingSession.current = false;
            return;
          }
        } else {
            questionnaireComplete =
              profile &&
              profile.display_name !== null && profile.display_name !== '' &&
              profile.lidia_instructions !== null && profile.lidia_instructions !== '' &&
              profile.work_scope !== null && profile.work_scope !== '';
        }

        console.log('Is questionnaire complete?', questionnaireComplete);

        if (questionnaireComplete) {
          console.log('Questionnaire IS complete. Determining navigation...');
          const fromState = location.state?.from;
          let intendedPath = '/dashboard';

          if (fromState) {
            if (typeof fromState === 'string' && fromState !== '/login' && fromState !== '/questionnaire') {
              intendedPath = fromState;
            } else if (typeof fromState === 'object' && fromState?.pathname && fromState.pathname !== '/login' && fromState.pathname !== '/questionnaire') {
              intendedPath = fromState.pathname;
            }
          }
          console.log(`Navigating to intended path: ${intendedPath}`);
          navigate(intendedPath, { replace: true });
        } else {
          console.log('Questionnaire IS NOT complete or profile missing. Navigating to /questionnaire');
          navigate('/questionnaire', { replace: true });
        }
      } catch (e: any) {
        console.error(`Exception processing user session (${eventType}):`, e.message);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      } finally {
        isProcessingSession.current = false;
      }
    };

    // Get initial session status immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log(`Initial getSession: User ID: ${session?.user?.id}, Current loading state: ${loading}`);
      if (session?.user) {
        // User is already logged in on initial load
        await processUserSession(session.user, 'INITIAL_SESSION');
      } else {
        // No user on initial session, ensure we are on /login and stop loading
        console.log("No user in initial session. Setting loading to false and ensuring we are on /login.");
        setLoading(false);
        if (location.pathname !== '/login') {
            navigate('/login', { replace: true }); // Ensure redirection to login if not already there
        }
      }
    });


    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth Event: ${event}, User ID: ${session?.user?.id}, Current processing ref: ${isProcessingSession.current}`);

      if (session?.access_token) {
        console.log("Supabase Access Token:", session.access_token);
      }

      // Only process if not already processing from the initial getSession call or another event
      if (!isProcessingSession.current) {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            await processUserSession(session.user, 'SIGNED_IN');
          } else {
            console.warn("SIGNED_IN event but no session.user. Setting loading to false.");
            setLoading(false);
             if (location.pathname !== '/login') {
                navigate('/login', { replace: true }); // Ensure redirection to login if no session user
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setMessage('');
          setError('');
          setLoading(false);
          console.log("SIGNED_OUT event. Navigating to /login if not already there.");
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
      }
    });

    return () => {
      console.log('--- Login.tsx: useEffect for onAuthStateChange - CLEANUP ---');
      subscription?.unsubscribe();
      isProcessingSession.current = false; // Reset ref on cleanup
    };
  }, [navigate, location.state, location.pathname]);


  const handleAzureSignIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email offline_access User.Read profile Chat.Read',
          redirectTo: 'http://localhost:5173/login', // This should point to your dashboard
          prompt: 'select_account',
        },
      });

      if (error) {
        throw error;
      }
      // Supabase will handle the redirect.
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Could not sign in with Microsoft.'}`);
      setLoading(false);
    }
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
      maxWidth: '380px',
      width: '100%',
      padding: '30px',
      boxSizing: 'border-box',
      borderRadius: '15px',
      background: 'rgba(255, 255, 255, 1)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(220, 220, 220, 0.8)',
    },
    logo: {
      width: '120px',
      height: 'auto',
      marginBottom: '30px',
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2)) invert(32%) sepia(37%) saturate(2878%) hue-rotate(287deg) brightness(88%) contrast(92%)'
    },
    welcomeTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      margin: '0 0 10px 0',
      color: '#333333',
      textShadow: 'none',
    },
    subtitle: {
      fontSize: '1.1rem',
      margin: '0 0 40px 0',
      color: '#666666',
    },
    button: {
      width: '100%',
      padding: '15px 20px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1.1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease',
      boxSizing: 'border-box',
      opacity: loading ? 0.7 : 1,
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    azureButton: {
      backgroundColor: '#333333', // Carbon color
      color: '#ffffff', // White text
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '30px',
    },
    azureButtonHover: {
      backgroundColor: '#555555', // Lighter carbon on hover
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
    },
    azureIcon: {
      width: '24px',
      height: '24px',
    },
    legalText: {
      fontSize: '0.85rem',
      color: '#888888',
      lineHeight: 1.6,
      marginTop: '20px',
    },
    legalLink: {
      color: '#007bff', // Blue for hyperlinks
      textDecoration: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'color 0.2s ease',
    },
    legalLinkHover: {
      color: '#0056b3', // Darker blue on hover
      textDecoration: 'underline',
    },
    messageText: {
      width: '100%',
      padding: '12px',
      margin: '15px 0',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '0.95rem',
      fontWeight: 500,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  };

  const handleButtonInteraction = (
    event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
    action: 'down' | 'up'
  ) => {
    if (loading) return;
    const target = event.currentTarget as HTMLButtonElement;
    target.style.transform = action === 'down' ? 'scale(0.97)' : 'scale(1)';
  };


  return (
    <div style={styles.loginContainer}>
      <div style={{ ...styles.waveBase, ...styles.waveDark }}></div>
      <div style={{ ...styles.waveBase, ...styles.waveMid }}></div>

      <div style={styles.contentWrapper}>
        <img src={LOGO_URL} alt="LIDIA Logo" style={styles.logo} />
        <h1 style={styles.welcomeTitle}>Welcome to LiDIA</h1> {/* Changed text here */}
        <p style={styles.subtitle}>Your smart personal assistant</p>

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

        <button
          style={{
            ...styles.button,
            ...styles.azureButton,
            ...(isAzureButtonHovered && !loading && styles.azureButtonHover),
          }}
          onMouseEnter={() => setIsAzureButtonHovered(true)}
          onMouseLeave={() => setIsAzureButtonHovered(false)}
          onMouseDown={(e) => handleButtonInteraction(e, 'down')}
          onMouseUp={(e) => handleButtonInteraction(e, 'up')}
          onTouchStart={(e) => handleButtonInteraction(e, 'down')}
          onTouchEnd={(e) => handleButtonInteraction(e, 'up')}
          onClick={handleAzureSignIn}
          disabled={loading}
        >
          <img src={AZURE_ICON_SVG_DATA_URI} alt="Azure" style={styles.azureIcon} />
          {loading ? 'Redirecting...' : 'Sign in with Microsoft'}
        </button>

        <p style={styles.legalText}>
          By clicking continue, you agree to our{' '}
          <a
            href="/terms"
            style={{
              ...styles.legalLink,
              ...(isTermsLinkHovered && styles.legalLinkHover),
            }}
            onMouseEnter={() => setIsTermsLinkHovered(true)}
            onMouseLeave={() => setIsTermsLinkHovered(false)}
            // Removed target="_blank" rel="noopener noreferrer"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            style={{
              ...styles.legalLink,
              ...(isPrivacyLinkHovered && styles.legalLinkHover),
            }}
            onMouseEnter={() => setIsPrivacyLinkHovered(true)}
            onMouseLeave={() => setIsPrivacyLinkHovered(false)}
            // Removed target="_blank" rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;