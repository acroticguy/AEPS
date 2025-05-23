import React, { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { supabase } from '../main'; // or your supabase client path
import type { User } from '@supabase/supabase-js'; // Import User type
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
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isPrimaryButtonHovered, setIsPrimaryButtonHovered] = useState<boolean>(false);
  const [isGoogleButtonHovered, setIsGoogleButtonHovered] = useState<boolean>(false);
  const [isTermsLinkHovered, setIsTermsLinkHovered] = useState<boolean>(false);
  const [isPrivacyLinkHovered, setIsPrivacyLinkHovered] = useState<boolean>(false);

  const isProcessingSession = useRef(false);

  // Redirect if user is already logged in or after successful login
  useEffect(() => {

    console.log(`LOGIN PAGE LOADED. Path: ${location.pathname}, State: ${JSON.stringify(location.state)}, Initial loading: ${loading}`);

    const processUserSession = async (user: User, eventType: 'INITIAL_SESSION' | 'SIGNED_IN') => {
      isProcessingSession.current = true; // Mark that we are starting to process
      console.log(`processUserSession called for event: ${eventType}, user ID: ${user.id}`);
      // setLoading(true); // No need to set true here if already true, or if we want to manage it carefully
      setError('');
      setMessage('');

      // Ensure loading is true for the duration of this async operation if it wasn't already
      // This is especially important if INITIAL_SESSION without user ran first and set loading to false
      if (!loading) setLoading(true);


      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, lidia_instructions, work_scope')
          .eq('id', user.id)
          .single();

        console.log('Fetched profile:', profile);
        if (profileError) console.error('Profile fetch error:', profileError);

        if (profileError && profileError.code !== 'PGRST116') {
          setError('Could not verify your profile. Please try logging in again or contact support.');
          navigate('/questionnaire', { replace: true }); // Fallback
          return; // Exit after navigation
        }

        const questionnaireComplete =
          profile &&
          profile.display_name &&
          profile.lidia_instructions &&
          profile.work_scope;

        console.log('Is questionnaire complete?', questionnaireComplete);
        if (profile) {
            console.log('Profile display_name:', `"${profile.display_name}" (truthy: ${!!profile.display_name})`);
            // ... other profile field logs
        }

        if (questionnaireComplete) {
          console.log('Questionnaire IS complete. Determining navigation...');
          if (eventType === 'INITIAL_SESSION') {
            console.log('INITIAL_SESSION: Navigating to /dashboard');
            navigate('/dashboard', { replace: true });
          } else { // SIGNED_IN
            const fromState = location.state?.from;
            let intendedPath = '/dashboard';
            if (typeof fromState === 'string' && fromState !== '/login' && fromState !== '/questionnaire') {
                intendedPath = fromState;
            } else if (typeof fromState === 'object' && fromState?.pathname && fromState.pathname !== '/login' && fromState.pathname !== '/questionnaire') {
                intendedPath = fromState.pathname;
            }
            console.log(`SIGNED_IN: Navigating to intended path: ${intendedPath}`);
            navigate(intendedPath, { replace: true });
          }
        } else {
          console.log('Questionnaire IS NOT complete. Navigating to /questionnaire');
          navigate('/questionnaire', { replace: true });
        }
      } catch (e: any) {
        console.error(`Exception processing user session (${eventType}):`, e.message);
        setError('An unexpected error occurred. Please try again.');
        navigate('/questionnaire', { replace: true }); // Fallback
      } finally {
        // Only set loading to false if we didn't navigate away,
        // or if a navigation error occurred and we want to show the login page again.
        // However, since navigation should happen, this setLoading(false) might not be strictly needed
        // if the component unmounts due to navigation.
        // For safety, if an error occurred and we didn't navigate, we should stop loading.
        // If navigation occurred, this component will unmount, and loading state doesn't matter.
        console.log(`processUserSession for ${eventType} FINALLY block.`);
        // setLoading(false); // Let the onAuthStateChange handler manage this more carefully
        isProcessingSession.current = false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth Event: ${event}, User ID: ${session?.user?.id}, Current loading state: ${loading}`);

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          // User is already logged in (e.g. refreshed /login page)
          // setLoading(true) is handled by processUserSession if needed
          await processUserSession(session.user, 'INITIAL_SESSION');
          // After processUserSession, navigation should have occurred.
          // If it navigates, this component unmounts, setLoading below is irrelevant.
          // If it didn't navigate (e.g. error before nav), then we might need to setLoading(false)
          // But processUserSession should handle its own loading for its scope.
          // The overall page loading should only be false if no user processing is active.
          if (!isProcessingSession.current) setLoading(false);

        } else {
          // No user on initial session. We are on /login. It's okay to show the form.
          console.log("INITIAL_SESSION with no user. Setting loading to false.");
          setLoading(false);
        }
      } else if (event === 'SIGNED_IN') {
        if (session?.user) {
          // User has just signed in (e.g., after OAuth redirect or magic link)
          // setLoading(true) is handled by processUserSession
          await processUserSession(session.user, 'SIGNED_IN');
          // Similar to above, navigation should occur.
           if (!isProcessingSession.current) setLoading(false);
        } else {
          // Edge case: SIGNED_IN event but no session.user? Should not happen.
          console.warn("SIGNED_IN event but no session.user. Setting loading to false.");
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setMessage('');
        setError('');
        setLoading(false);
        // Optional: if not on /login, redirect to /login
        // if (location.pathname !== '/login') navigate('/login', { replace: true });
      } else if (event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
        // These events usually don't require immediate page loading state changes
        // unless they affect user presence for this page.
        console.log(`Auth Event ${event} received. No explicit loading state change here.`);
      }

      // If after all event handling, we are not processing a session and still loading, stop loading.
      // This is a safeguard.
      // Note: `loading` in the console.log at the start of this callback is the state *before* any setLoading call within this callback.
      // We need to check `isProcessingSession.current` to see if an async operation *started*.
      if (loading && !isProcessingSession.current && !session?.user) {
         // If we are still in a loading state, and no session processing was triggered,
         // and there's no user, then it's safe to stop page loading.
         console.log("Safeguard: Not processing session, no user, setting loading to false.");
         // setLoading(false); // Be careful with this, could cause rapid toggles.
                          // The explicit setLoading(false) in INITIAL_SESSION w/o user and SIGNED_OUT should be sufficient.
      }
    });


    return () => {
      console.log('--- Login.tsx: useEffect for onAuthStateChange - CLEANUP ---');
      subscription?.unsubscribe();
      isProcessingSession.current = false; // Reset ref on cleanup
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
    setLoading(true); // Show loading for the action itself
    setMessage('');
    setError('');
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`, // Explicitly redirect back to login
      },
    });

    if (googleError) {
      setError(`Error: ${googleError.message}`);
      console.error('Error signing in with Google:', googleError);
      setLoading(false); // Stop loading if OAuth init failed
    }
    // If successful, Supabase redirects. onAuthStateChange will handle it on return.
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
            onMouseLeave={() => setIsTermsLinkHovered(false)} // Corrected
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