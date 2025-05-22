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
  // Add other styles as needed
}

// --- Main Component ---
const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate(); // <-- Initialize useNavigate
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Apply global styles and focus input on step change
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    document.body.style.backgroundColor = '#1a0d4a'; // Fallback: Darkest wave color
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100%';
    }

    // Focus input on step change
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      // Cleanup styles if component unmounts
      document.body.style.margin = '';
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      if (rootElement) {
        rootElement.style.height = '';
      }
    };
  }, [currentStep]); // Re-run when currentStep changes for focus

  const currentQuestion = QUESTIONS[currentStep];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit logic
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Mark current question as skipped or simply move to next
    // For simplicity, let's just move to the next or submit
    console.log(`Skipped question: ${currentQuestion.text}`);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(); // Or navigate away if skip on last means skip all
    }
  };

  const handleSubmit = async (isSkippingLast?: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log('Submitting answers to Supabase...');

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Error fetching user or no user logged in:', authError);
      alert('You must be logged in to submit the questionnaire.');
      setIsSubmitting(false);
      navigate('/login'); // Redirect to login if user somehow lost session
      return;
    }


    const updatePayload: {
      display_name?: string;
      work_scope?: string;
      lidia_instructions?: string;
    } = {};

    if (answers.hasOwnProperty('name')) {
      updatePayload.display_name = answers['name'];
    }
    if (answers.hasOwnProperty('workScope')) {
      updatePayload.work_scope = answers['workScope'];
    }
    if (answers.hasOwnProperty('aiFeel')) {
      updatePayload.lidia_instructions = answers['aiFeel'];
    }

    if (Object.keys(updatePayload).length === 0 && !isSkippingLast) {
      console.log('No relevant answers provided to update the profile.');
      // Decide if alert is needed or just navigate
      // alert('No new information was provided to update your profile.');
      setIsSubmitting(false);
      navigate('/dashboard'); // Navigate even if nothing was updated from this form
      return;
    }

    if (Object.keys(updatePayload).length > 0 || isSkippingLast) {
        const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload) // Send empty payload if skipping and nothing was answered
        .eq('id', user.id);

        if (updateError) {
        console.error('Error updating profile:', updateError);
        alert(`Failed to update profile: ${updateError.message}`);
        setIsSubmitting(false);
        return; // Stay on page on error
        } else {
        console.log('Profile update processed (or skipped).');
        // alert('Questionnaire submitted and profile updated successfully!'); // Optional alert
        }
    }

    setIsSubmitting(false);
    console.log('Navigating to dashboard...');
    navigate('/dashboard', { replace: true }); // <-- Navigate to dashboard
    
  };


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
      backgroundColor: '#6a1b9a', // Lightest purple, base for content area
    },
    // Wave styles from your provided snippet
    waveBase: {
        content: '""', // This is more for pseudo-elements, but kept for concept
        position: 'absolute',
        left: '50%',
        width: '200%',
        zIndex: 1,
        borderBottomLeftRadius: '50% 100px', // String value should be acceptable by CSSProperties
        borderBottomRightRadius: '50% 100px',
      },
      waveDark: {
        backgroundColor: '#1a0d4a',
        top: '-35%',
        height: '75%',
        transform: 'translateX(-50%) rotate(-4deg)',
        zIndex: 3, // Lower z-index wave
      },
      waveMid: {
        backgroundColor: '#4a1f74',
        top: '-25%',
        height: '70%',
        transform: 'translateX(-50%) rotate(3deg)',
        zIndex: 2, // Higher z-index wave
      },
    
    contentWrapper: {
      position: 'relative',
      zIndex: 3, // Above the waves
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      color: '#fff',
      maxWidth: '500px', // Max width for the content/form
      width: '100%',
      padding: '30px',
      boxSizing: 'border-box',
    },
    questionText: {
      fontSize: '2.5rem', // Larger font for the question
      fontWeight: 'bold',
      marginBottom: '40px',
      color: '#FFFFFF',
      textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
    },
    inputGroup: {
      width: '100%',
      marginBottom: '30px',
      textAlign: 'left',
    },
    inputLabel: {
      display: 'block',
      fontSize: '0.9rem',
      color: '#E0C6F5', // Light purple for label
      marginBottom: '8px',
      paddingLeft: '5px',
    },
    inputField: {
      width: '100%',
      padding: '15px 20px',
      border: '1px solid transparent', // No visible border initially
      borderRadius: '8px',
      fontSize: '1.1rem',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      color: '#333333',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center', // Center buttons if only one, or manage spacing
      alignItems: 'center',
      width: '100%',
      gap: '15px', // Space between Back and Next/Submit buttons
    },
    button: {
      padding: '12px 30px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: '#0C0A2C', // Dark blue
      color: 'white',
      transition: 'background-color 0.2s ease',
      minWidth: '120px', // Ensure buttons have a decent width
    },
    skipLink: {
      color: '#E0C6F5', // Light purple, same as label
      fontSize: '0.9rem',
      cursor: 'pointer',
      textDecoration: 'underline',
      marginLeft: '20px', // Space it from the Next/Submit button
      padding: '10px 0', // Make it easier to click
    },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Background Waves (simulated with divs) */}
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

        <div style={styles.buttonContainer}>
          {currentStep > 0 && (
            <button onClick={handleBack} style={styles.button}>
              Back
            </button>
          )}
          <button onClick={handleNext} style={{...styles.button, flexGrow: currentStep === 0 ? 1 : 0 }}> {/* Make Next/Submit take more space if no Back button */}
            {currentStep === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
          </button>
          {currentStep < QUESTIONS.length - 1 && ( // Only show Skip if not on the last question (or adjust logic)
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