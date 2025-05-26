import React, { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../main';
import type { User } from '@supabase/supabase-js';
import lidiaLogo from '../assets/lidiaLogo.png';
import googleLogo from "../assets/googleLogo.png";

// --- Supabase Client Setup ---
const LOGO_URL: string = lidiaLogo;
const GOOGLE_ICON_SVG_DATA_URI: string = googleLogo;

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
  messageText: CSSProperties;
  loadingSpinner?: CSSProperties;
}

const Login: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // Start loading true to check session
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isPrimaryButtonHovered, setIsPrimaryButtonHovered] = useState<boolean>(false);
  const [isGoogleButtonHovered, setIsGoogleButtonHovered] = useState<boolean>(false);
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
                profile.display_name &&
                profile.lidia_instructions &&
                profile.work_scope;
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


  // (rest of your component's styling and form submission handlers go here)
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
        emailRedirectTo: `${window.location.origin}/login`,
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
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (googleError) {
      setError(`Error: ${googleError.message}`);
      console.error('Error signing in with Google:', googleError);
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
      opacity: loading ? 0.7 : 1,
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
    if (loading) return;
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
            href="/terms"
            style={{
              ...styles.legalLink,
              ...(isTermsLinkHovered && styles.legalLinkHover),
            }}
            onMouseEnter={() => setIsTermsLinkHovered(true)}
            onMouseLeave={() => setIsTermsLinkHovered(false)}
            target="_blank" rel="noopener noreferrer"
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