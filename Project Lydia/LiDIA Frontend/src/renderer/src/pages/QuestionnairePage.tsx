import React, { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { supabase } from '../main'; // <-- Assuming supabase is exported from main.tsx or a client file
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate

// --- Configuration ---
interface Question {
  id: string; // Used as key for answers
  text: string;
  placeholder: string;
  label: string;
}

const QUESTIONS: Question[] = [
  { id: 'name', text: 'What is your name?', label: 'Name', placeholder: 'Enter your name' },
  { id: 'workScope', text: 'What is the scope of your work?', label: 'Scope of Work', placeholder: 'e.g., Software Development, Marketing, Research' },
  { id: 'aiFeel', text: 'How would you want your AI assistant to feel like?', label: 'AI Assistant Feel', placeholder: 'e.g., Friendly, Professional, Creative' },
];

type Answers = Record<string, string>;

// --- Styles Interface ---
interface ComponentStyles {
  pageContainer: CSSProperties;
  waveBase: CSSProperties;
  waveDark: CSSProperties;
  waveMid: CSSProperties;
  contentWrapper: CSSProperties;
  questionText: CSSProperties;
  inputGroup: CSSProperties;
  inputLabel: CSSProperties;
  inputField: CSSProperties;
  buttonContainer: CSSProperties;
  button: CSSProperties;
  skipLink: CSSProperties;
  messageText: CSSProperties; // Added for error/success messages
}

const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentQuestion = QUESTIONS[currentStep];

  useEffect(() => {
    // Check authentication on component mount
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log('No active session found on QuestionnairePage. Redirecting to login.');
        navigate('/login', { replace: true });
      } else {
        console.log('User is logged in!', session.user.email);
        // If user is logged in, try to fetch their profile to see if questionnaire is already complete
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, lidia_instructions, work_scope')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
             // Handle actual profile fetch errors other than 'no rows found'
            setError('Error checking profile. Please refresh or try again.');
            return;
        }

        const questionnaireComplete = profile && profile.display_name && profile.lidia_instructions && profile.work_scope;

        if (questionnaireComplete) {
            console.log('Questionnaire already complete. Redirecting to dashboard.');
            navigate('/dashboard', { replace: true });
        }
      }
    };

    checkUser();

    // Focus on the input field when the question changes
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep, navigate]); // Add navigate to dependencies

  // --- Enter Key Submission ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        handleNext(); // Trigger the 'Next' or 'Submit' logic
      }
    };

    // Attach listener to the input field itself for more precise control
    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [currentStep, answers]); // Re-attach listener if question changes or answers change

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, [e.target.id]: e.target.value });
  };

  const handleNext = async () => {
    setMessage('');
    setError('');

    // Basic validation for the current question
    if (!answers[currentQuestion.id] || answers[currentQuestion.id].trim() === '') {
      setError(`Please provide an answer for "${currentQuestion.label}".`);
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question - submit data to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('You are not logged in. Please log in to complete the questionnaire.');
          navigate('/login', { state: { from: '/questionnaire' } }); // Redirect to login
          return;
        }

        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            display_name: answers.name,
            work_scope: answers.workScope,
            lidia_instructions: answers.aiFeel,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          setError(`Error submitting questionnaire: ${updateError.message}`);
          return;
        }

        setMessage('Questionnaire submitted successfully!');
        navigate('/dashboard', { replace: true });
      } catch (submitError: any) {
        console.error('Submission failed:', submitError);
        setError(`An unexpected error occurred during submission: ${submitError.message}`);
      }
    }
  };

  const handleBack = () => {
    setError('');
    setMessage('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setMessage('');
    setError('');
    // Optionally save partial data, or just proceed
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If on the last question and skipping, it means they are submitting without all answers
      // This might require different logic based on your business rules.
      // For now, let's assume skipping on the last question is not allowed, or
      // it still attempts to submit, but with potentially empty fields.
      // For this example, let's just navigate to dashboard if they skip the last.
      setMessage('Skipping last question. You can update profile later.');
      navigate('/dashboard', { replace: true });
    }
  };

  // --- Styles (rest of your styles remain the same) ---
  const styles: ComponentStyles = {
    pageContainer: {
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
      maxWidth: '500px',
      width: '100%',
      padding: '40px',
      boxSizing: 'border-box',
      borderRadius: '15px',
      backgroundColor: 'rgba(0,0,0,0.2)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    },
    questionText: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#ffffff',
      textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
    },
    inputGroup: {
      width: '100%',
      marginBottom: '25px',
      textAlign: 'left',
    },
    inputLabel: {
      display: 'block',
      fontSize: '1rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#e0c6f5',
    },
    inputField: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '1rem',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      color: '#333',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: '20px',
      gap: '15px', // Space between buttons
    },
    button: {
      padding: '12px 25px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: '#0c0a2c',
      color: 'white',
      transition: 'background-color 0.2s ease, transform 0.1s ease',
      flexGrow: 1, // Allow buttons to grow
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    skipLink: {
      padding: '12px 0',
      fontSize: '0.9rem',
      color: '#e0c6f5',
      cursor: 'pointer',
      textDecoration: 'underline',
      transition: 'color 0.2s ease',
      alignSelf: 'center', // Align with buttons vertically
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

  return (
    <div style={styles.pageContainer}>
      <div style={{ ...styles.waveBase, ...styles.waveDark }}></div>
      <div style={{ ...styles.waveBase, ...styles.waveMid }}></div>

      <div style={styles.contentWrapper}>
        <h1 style={styles.questionText}>{currentQuestion.text}</h1>

        <div style={styles.inputGroup}>
          <label htmlFor={currentQuestion.id} style={styles.inputLabel}>
            {currentQuestion.label}
          </label>
          <input
            ref={inputRef}
            type="text"
            id={currentQuestion.id}
            name={currentQuestion.id}
            value={answers[currentQuestion.id] || ''}
            onChange={handleInputChange}
            placeholder={currentQuestion.placeholder}
            style={styles.inputField}
          />
        </div>

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

        <div style={styles.buttonContainer}>
          {currentStep > 0 && (
            <button onClick={handleBack} style={styles.button}>
              Back
            </button>
          )}
          <button onClick={handleNext} style={{...styles.button, flexGrow: currentStep === 0 ? 1 : 0 }}>
            {currentStep === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
          </button>
          {currentStep < QUESTIONS.length - 1 && (
            <span onClick={handleSkip} style={styles.skipLink}>
              Skip
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;