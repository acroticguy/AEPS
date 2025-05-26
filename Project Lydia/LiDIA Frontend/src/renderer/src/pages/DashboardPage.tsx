import React, { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { supabase, acquireMsalToken } from '../main'; // or your supabase client path

// --- Types ---
interface TodaysTask {
  id: string;
  text: string;
  completed: boolean; // For visual representation
}

type Priority = 'High' | 'Medium' | 'Low';

interface ActiveIssue {
  id: string; // e.g., FIG-123
  title: string;
  project: string;
  priority: Priority;
  date: string; // e.g., "Dec 5"
  userAvatarUrl?: string; // URL to user avatar
  userNameFallback: string; // e.g., "JD" for John Doe
}

// --- Icon SVGs (Simple Placeholders) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
  </svg>
);
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
  </svg>
);
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
  </svg>
);
const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
  </svg>
);
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
    <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
  </svg>
);
const MoreDotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
  </svg>
);
const UserAvatarPlaceholder = ({ fallback }: { fallback: string }) => (
  <div style={{
    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#555',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold',
    backgroundImage: 'url("https://source.unsplash.com/random/50x50?face")' // Random placeholder
  }}>
    {/* {fallback} Optional: show fallback if image fails, but here we assume bg image works */}
  </div>
);


// --- Styles Interface ---
interface ComponentStyles {
  appContainer: CSSProperties;
  sidebar: CSSProperties;
  sidebarHeader: CSSProperties;
  todaysTaskList: CSSProperties;
  todaysTaskItem: CSSProperties;
  taskCheckbox: CSSProperties;
  taskText: CSSProperties;
  sidebarFooter: CSSProperties;
  sidebarIcon: CSSProperties;
  mainContent: CSSProperties;
  mainHeader: CSSProperties;
  activeIssuesTitle: CSSProperties;
  searchFilterArea: CSSProperties;
  searchInputContainer: CSSProperties;
  searchInput: CSSProperties;
  searchIcon: CSSProperties;
  filterButton: CSSProperties;
  viewToggleContainer: CSSProperties;
  viewToggleButton: CSSProperties;
  viewToggleButtonActive: CSSProperties;
  issuesTable: CSSProperties;
  tableHeaderRow: CSSProperties;
  tableHeaderCell: CSSProperties;
  tableRow: CSSProperties;
  tableCell: CSSProperties;
  projectTag: CSSProperties;
  priorityTagBase: CSSProperties;
  priorityTagHigh: CSSProperties;
  priorityTagMedium: CSSProperties;
  priorityTagLow: CSSProperties;
  userCell: CSSProperties;
  actionCell: CSSProperties;
  actionDots: CSSProperties;
  logoutButton: CSSProperties;
  runScriptButton: CSSProperties;
  pythonOutputArea: CSSProperties;
  pythonErrorArea: CSSProperties;
  // Add any other specific styles needed
}

// --- Main Component ---
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [todaysTasks, setTodaysTasks] = useState<TodaysTask[]>([]);
  const [activeIssues, setActiveIssues] = useState<ActiveIssue[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeView, setActiveView] = useState<'list' | 'grid' | 'calendar'>('list');

  const [pythonOutput, setPythonOutput] = useState('');
  const [pythonError, setPythonError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptRunning, setIsScriptRunning] = useState(false);

  // Simulate API calls
  useEffect(() => {
    // Fetch Today's Tasks (mock)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
    const fetchTodaysTasks = async () => {
      // Replace with actual API call:
      // const response = await fetch('/api/todays-tasks?date=today');
      // const data = await response.json();
      const mockData: TodaysTask[] = [
        { id: '1', text: 'Call Sarah', completed: false },
        { id: '2', text: 'Write email', completed: false },
        { id: '3', text: '5 pm meeting', completed: false },
        { id: '4', text: 'Finish presentation', completed: true }, // Example of completed
        { id: '5', text: 'Write annual report', completed: false },
      ];
      setTodaysTasks(mockData);
    };

    // Fetch Active Issues (mock)
    const fetchActiveIssues = async () => {
      const mockData: ActiveIssue[] = [
        { id: 'FIG-123', title: 'Task 1', project: 'Project1', priority: 'High', date: 'Dec 5', userNameFallback: 'AW' },
        { id: 'FIG-122', title: 'Task 2', project: 'Acme GTM', priority: 'Low', date: 'Dec 5', userNameFallback: 'BX' },
        { id: 'FIG-121', title: 'Write blog post for demo day', project: 'Acme GTM', priority: 'High', date: 'Dec 5', userNameFallback: 'CY' },
        { id: 'FIG-120', title: 'Publish blog page', project: 'Website launch', priority: 'Low', date: 'Dec 5', userNameFallback: 'DZ' },
        { id: 'FIG-119', title: 'Add gradients to design system', project: 'Design backlog', priority: 'Medium', date: 'Dec 5', userNameFallback: 'EA' },
        { id: 'FIG-118', title: 'Responsive behavior doesn\'t work on Android', project: 'Bug fixes', priority: 'Medium', date: 'Dec 5', userNameFallback: 'FB' },
        { id: 'FIG-117', title: 'Confirmation states not rendering properly', project: 'Bug fixes', priority: 'Medium', date: 'Dec 5', userNameFallback: 'GC' },
        { id: 'FIG-116', title: 'Text wrapping is awkward on older iPhones', project: 'Bug fixes', priority: 'Low', date: 'Dec 5', userNameFallback: 'HD' },
      ];
      setActiveIssues(mockData);
    };

    fetchTodaysTasks();
    fetchActiveIssues();


    if (window.electronAPI) {
      // These listeners will be cleaned up when the component unmounts
      window.electronAPI.onPythonStdout((event, data) => {
        setPythonOutput((prev) => prev + data);
      });

      window.electronAPI.onPythonStderr((event, data) => {
        setPythonError((prev) => prev + data);
      });

      window.electronAPI.onPythonScriptComplete((event, returnCode, stderr) => {
        setIsLoading(false);
        setIsScriptRunning(false);
        if (returnCode !== 0) {
          setPythonError((prev) => prev + `\nScript exited with code: ${returnCode}`);
        }
        if (stderr) {
          setPythonError((prev) => prev + `\nFinal Error from Main Process: ${stderr}`);
        }
      });
    }

    return () => {
      // Remove listeners when component unmounts
      if (window.electronAPI) {
        window.electronAPI.removePythonStdoutListener();
        window.electronAPI.removePythonStderrListener();
        window.electronAPI.removePythonScriptCompleteListener();
        // Also attempt to stop script if it's running
        if (isScriptRunning) { // Use the current state here, or pass it into the cleanup function
          console.log('Component unmounting, attempting to stop Python script...');
          window.electronAPI.stopPythonScript().catch(e => console.error('Error stopping script on unmount:', e));
        }
      }
    };

  }, [navigate, isScriptRunning]);

  const runPythonScriptOnMount = useCallback(async () => {
    if (isScriptRunning) {
      console.warn("Python script is already running. Please wait or stop it first.");
      return;
    }

    setIsLoading(true);
    setIsScriptRunning(true);
    setPythonOutput(''); // Clear previous output
    setPythonError(''); // Clear previous error

    // Check if the Electron API is available before calling it
    if (window.electronAPI) {
      try {
        console.log('Running Python script...');

        // Set up IPC listeners for streaming output
        window.electronAPI.onPythonStdout((event, data: string) => {
          setPythonOutput((prev) => prev + data);
        });

        window.electronAPI.onPythonStderr((event, data: string) => {
          setPythonError((prev) => prev + data);
        });

        // Listen for script completion/exit
        window.electronAPI.onPythonScriptComplete((event, returnCode: number, stderr: string) => {
          setIsLoading(false);
          setIsScriptRunning(false);
          if (returnCode !== 0) {
            setPythonError((prev) => prev + `\nScript exited with code: ${returnCode}`);
          }
          if (stderr) {
            setPythonError((prev) => prev + `\nFinal Error from Main Process: ${stderr}`);
          }
          console.log('Python script finished via IPC.');
          // Clean up listeners after script completes if they are temporary
          // For persistent listeners, you might remove them in useEffect cleanup
        });

        acquireMsalToken().then(async (msalToken: string) => {
          console.log('Acquired MSAL token:', msalToken);
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken: string = session?.access_token || '';
          const refreshToken: string = session?.refresh_token || '';

          // Now run the Python script with the acquired tokens
          // The return value of runPythonScript is now just a confirmation that it started
          await window.electronAPI.runPythonScript([accessToken, refreshToken, msalToken]);
          console.log('Python script execution initiated.');
        });

      } catch (error: any) {
        console.error('Error invoking Python script via Electron API:', error);
        setPythonError((prev) => prev + `\nError during Electron API call: ${error.message}`);
        setIsLoading(false);
        setIsScriptRunning(false);
      }
    } else {
      console.warn("Electron API not available. Cannot run Python script outside Electron environment.");
      setIsLoading(false);
      setIsScriptRunning(false);
      setPythonError("Electron API not available.");
    }
  }, [isScriptRunning]);


  const handleLogout = async () => {
    console.log('Attempting logout from DashboardPage...');
    const { data: { session: preLogoutSession } } = await supabase.auth.getSession();
    console.log('Session state just before signOut:', preLogoutSession);

    if (!preLogoutSession) {
      console.warn('No active session found before signOut. Redirecting to login anyway.');
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error logging out:', error);
        // Display a user-friendly error message if needed
      } else {
        console.log('Successfully logged out.');
        navigate('/login'); // Redirect to login after successful logout
      }
    } catch (e: any) {
      console.error('An unexpected error occurred during logout:', e);
      // This catches any synchronous errors during the signOut call
    }
  };

  // const handleRunPython = async () => {
  //   setIsLoading(true);
  //   setPythonOutput('');
  //   setPythonError('');
  //   try {
  //     // Pass arguments to the Python script
  //     const result = await window.electronAPI.runPythonScript(['arg1', 'ACCESS_TOKEN']);
  //     console.log('Python script finished:', result);
  //     // Final output might be captured in the result object, or just rely on streaming
  //     if (result.stderr) {
  //       setPythonError((prev) => prev + '\nFinal Error: ' + result.stderr);
  //     }
  //     if (result.returnCode !== 0) {
  //       setPythonError((prev) => prev + `\nScript exited with code: ${result.returnCode}`);
  //     }
  //   } catch (error: any) {
  //     console.error('Error running Python script:', error);
  //     setPythonError((prev) => prev + `\nFailed to execute script: ${error.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // handleRunPython();

  const styles: ComponentStyles = {
    appContainer: {
      display: 'flex',
      height: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#1E0A3C', // Darkest background for overall page
      color: '#E0E0E0',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#1E0A3C', // Dark purple sidebar
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #3A1F5F', // Subtle separator
    },
    sidebarHeader: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#FFFFFF',
    },
    todaysTaskList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      flexGrow: 1,
    },
    todaysTaskItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 5px',
      marginBottom: '8px',
      borderRadius: '6px',
      backgroundColor: '#2B124A', // Slightly lighter purple for items
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    taskCheckbox: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      border: '2px solid #9575CD', // Light purple border
      backgroundColor: 'transparent',
      marginRight: '12px',
      display: 'inline-block',
    },
    // taskCheckboxCompleted: { // TODO: Style for completed state
    //   backgroundColor: '#7E57C2',
    //   borderColor: '#7E57C2',
    // },
    taskText: {
      fontSize: '0.95rem',
      color: '#E0E0E0',
    },
    sidebarFooter: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: '20px',
      borderTop: '1px solid #3A1F5F',
    },
    sidebarIcon: {
      cursor: 'pointer',
      color: '#B0AEC0',
      padding: '8px',
      borderRadius: '50%',
      backgroundColor: '#2B124A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainContent: {
      flex: 1,
      backgroundColor: '#3A1F5F', // Lighter purple for main area
      padding: '25px 30px',
      overflowY: 'auto',
    },
    mainHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
    },
    activeIssuesTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    searchFilterArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    searchInputContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: '6px',
      padding: '0px 10px',
      width: '300px', // Adjust as needed
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      padding: '10px 5px',
      fontSize: '0.9rem',
      flexGrow: 1,
      backgroundColor: 'transparent',
      color: '#333',
    },
    searchIcon: {
        color: '#777',
        marginRight: '5px',
    },
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 15px',
      backgroundColor: '#FFFFFF',
      color: '#333',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    viewToggleContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: '6px',
      padding: '3px',
    },
    viewToggleButton: {
      padding: '7px 10px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: '#555',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewToggleButtonActive: {
      backgroundColor: '#2B124A', // Dark purple selected
      color: '#FFFFFF',
    },
    issuesTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 10px', // Creates space between rows
      backgroundColor: '#2B124A', // Header and row background
      borderRadius: '8px', // Overall table rounding (might need wrapper)
      padding: '10px',
    },
    tableHeaderRow: {
      textAlign: 'left',
      color: '#C0B9D1', // Lighter text for headers
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    tableHeaderCell: {
      padding: '12px 15px',
      borderBottom: '2px solid #3A1F5F', // Separator for header
    },
    tableRow: {
      backgroundColor: '#2B124A', // Rows have the same darker purple
      color: '#E0E0E0',
       // borderRadius: '6px', // This won't work directly on tr, style td instead or use border-spacing
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow for rows
    },
    tableCell: {
      padding: '15px 15px',
      borderBottom: '1px solid #3A1F5F', // Separator between rows
      verticalAlign: 'middle',
    },
    projectTag: {
      backgroundColor: '#111', // Dark tag
      color: '#FFFFFF',
      padding: '4px 10px',
      borderRadius: '12px', // Pill shape
      fontSize: '0.8rem',
      display: 'inline-block',
      border: '1px solid #444',
    },
    priorityTagBase: {
      color: '#FFFFFF',
      padding: '5px 12px',
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
      minWidth: '60px',
    },
    priorityTagHigh: {
      backgroundColor: '#E91E63', // Pink
    },
    priorityTagMedium: {
      backgroundColor: '#AB47BC', // Light Purple
    },
    priorityTagLow: {
      backgroundColor: '#7E57C2', // Darker Purple
    },
    userCell: {
      display: 'flex',
      alignItems: 'center',
    },
    actionCell: {
      textAlign: 'center',
    },
    actionDots: {
      cursor: 'pointer',
      color: '#B0AEC0',
    },
    logoutButton: { // Added style definition for logout button
      padding: '10px 18px',
      backgroundColor: '#FFFFFF', 
      color: '#333', 
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
    },
    runScriptButton: {
      padding: '10px 18px',
      backgroundColor: '#9575CD', // A nice purple
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginRight: '15px', // Space between this and other elements
      opacity: isScriptRunning ? 0.6 : 1, // Indicate disabled state
      pointerEvents: isScriptRunning ? 'none' : 'auto', // Disable clicks when running
    },
    pythonOutputArea: {
      backgroundColor: '#111',
      color: '#00FF00', // Green text for output
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      minHeight: '100px',
      maxHeight: '300px',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap', // Preserve whitespace and wrap text
      fontFamily: 'monospace',
      border: '1px solid #3A1F5F',
    },
    pythonErrorArea: {
      backgroundColor: '#440000', // Dark red for errors
      color: '#FF0000', // Red text for errors
      padding: '15px',
      borderRadius: '8px',
      marginTop: '10px',
      minHeight: '50px',
      maxHeight: '150px',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace',
      border: '1px solid #FF0000',
    },
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'High': return { ...styles.priorityTagBase, ...styles.priorityTagHigh };
      case 'Medium': return { ...styles.priorityTagBase, ...styles.priorityTagMedium };
      case 'Low': return { ...styles.priorityTagBase, ...styles.priorityTagLow };
      default: return styles.priorityTagBase;
    }
  };


  return (
    <div style={styles.appContainer}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarHeader}>Today's Tasks</h2>
        <ul style={styles.todaysTaskList}>
          {todaysTasks.map(task => (
            <li key={task.id} style={styles.todaysTaskItem}>
              <span style={{
                ...styles.taskCheckbox,
                ...(task.completed ? { backgroundColor: '#7E57C2', borderColor: '#7E57C2' } : {})
              }}></span>
              <span style={styles.taskText}>{task.text}</span>
            </li>
          ))}
        </ul>
        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarIcon}><PlusIcon /></div>
          <div style={styles.sidebarIcon}><MicIcon /></div>
          <div style={styles.sidebarIcon}><MoreDotsIcon /></div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.mainHeader}>
          <h2 style={styles.activeIssuesTitle}>Active issues</h2>
          <div style={styles.searchFilterArea}>
            <div style={styles.searchInputContainer}>
                <span style={styles.searchIcon}><SearchIcon /></span>
                <input
                type="text"
                placeholder="Search Tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                />
            </div>
            <button style={styles.filterButton}><FilterIcon /> Filter</button>
            <div style={styles.viewToggleContainer}>
              <button
                style={{ ...styles.viewToggleButton, ...(activeView === 'list' ? styles.viewToggleButtonActive : {}) }}
                onClick={() => setActiveView('list')}
              >
                <ListIcon />
              </button>
              <button
                style={{ ...styles.viewToggleButton, ...(activeView === 'grid' ? styles.viewToggleButtonActive : {}) }}
                onClick={() => setActiveView('grid')}
              >
                <GridIcon />
              </button>
              <button
                style={{ ...styles.viewToggleButton, ...(activeView === 'calendar' ? styles.viewToggleButtonActive : {}) }}
                onClick={() => setActiveView('calendar')}
              >
                <CalendarIcon />
              </button>
            </div>
          </div>
          {/* New Button to Run Python Script */}
          <button
            onClick={runPythonScriptOnMount}
            style={styles.runScriptButton}
            disabled={isLoading || isScriptRunning} // Disable if already loading or running
          >
            {isLoading || isScriptRunning ? 'Running...' : 'Run Python Script'}
          </button>
          {/* Logout Button */}
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Python Script Output Area */}
        {pythonOutput && (
          <div>
            <h3>Python Output:</h3>
            <pre style={styles.pythonOutputArea}>{pythonOutput}</pre>
          </div>
        )}
        {pythonError && (
          <div>
            <h3>Python Errors:</h3>
            <pre style={styles.pythonErrorArea}>{pythonError}</pre>
          </div>
        )}

        {activeView === 'list' && (
          <table style={styles.issuesTable}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{...styles.tableHeaderCell, width: '10%'}}>Task</th>
                <th style={{...styles.tableHeaderCell, width: '35%'}}>Title</th>
                <th style={{...styles.tableHeaderCell, width: '18%'}}>Project</th>
                <th style={{...styles.tableHeaderCell, width: '12%'}}>Priority</th>
                <th style={{...styles.tableHeaderCell, width: '10%'}}>Date</th>
                <th style={{...styles.tableHeaderCell, width: '10%'}}>User</th>
                <th style={{...styles.tableHeaderCell, width: '5%'}}></th>
              </tr>
            </thead>
            <tbody>
              {activeIssues
                .filter(issue => issue.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(issue => (
                <tr key={issue.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{issue.id}</td>
                  <td style={styles.tableCell}>{issue.title}</td>
                  <td style={styles.tableCell}>
                    <span style={styles.projectTag}>{issue.project}</span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={getPriorityStyle(issue.priority)}>{issue.priority}</span>
                  </td>
                  <td style={styles.tableCell}>{issue.date}</td>
                  <td style={{...styles.tableCell, ...styles.userCell}}>
                    <UserAvatarPlaceholder fallback={issue.userNameFallback} />
                  </td>
                  <td style={{...styles.tableCell, ...styles.actionCell}}>
                    <span style={styles.actionDots}><MoreDotsIcon /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Placeholder for Grid and Calendar views */}
        {activeView === 'grid' && <p>Grid view is not implemented.</p>}
        {activeView === 'calendar' && <p>Calendar view is not implemented.</p>}
      </div>
    </div>
  );
};

export default DashboardPage;