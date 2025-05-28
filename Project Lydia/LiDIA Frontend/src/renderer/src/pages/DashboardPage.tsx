import React, { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../main';

// --- Types ---
interface TodaysTask {
  id: string;
  text: string;
  completed: boolean; // For visual representation
}

type Priority = 'High' | 'Medium' | 'Low'; // Still use these for display

interface ActiveIssue {
  id: string; // Corresponds to task_id (or a unique identifier)
  title: string; // Corresponds to task_name or description
  project: string; // We'll infer or use a placeholder for now as 'project' is not directly in 'tasks' table
  priority: Priority; // Mapped from 1-5 to High/Medium/Low
  date: string; // Corresponds to due_date
  originalDate: Date; // To store the original Date object for sorting/calendar
  userAvatarUrl?: string; // URL to user avatar
  userNameFallback: string; // e.g., "JD" for John Doe
  description?: string; // Added description field for Active Issues
}

// --- Icon SVGs (Simple Placeholders) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
  </svg>
);
const SortIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
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
const UserAvatarPlaceholder = ({ fallback }: { fallback: string }) => (
  <div style={{
    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#555',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold',
    backgroundImage: 'url("https://source.unsplash.com/random/50x50?face")'
  }}>
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
  sortButton: CSSProperties; // Renamed from filterButton
  sortDropdown: CSSProperties; // New style for the dropdown
  sortDropdownItem: CSSProperties; // New style for dropdown items
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
  completeButton: CSSProperties; // New style for the complete button
  logoutButton: CSSProperties;
  runScriptButton: CSSProperties;
  pythonOutputArea: CSSProperties;
  pythonErrorArea: CSSProperties;
  developerModeContainer: CSSProperties;
  developerModeCheckbox: CSSProperties;
  developerModeLabel: CSSProperties;
  expandedDescriptionRow: CSSProperties; // New style for expanded description row
  expandedDescriptionCell: CSSProperties; // New style for the cell containing the description
  // New styles for Grid View
  issuesGrid: CSSProperties;
  issueCard: CSSProperties;
  issueCardHeader: CSSProperties;
  issueCardTitle: CSSProperties;
  issueCardDetails: CSSProperties;
  issueCardDetailItem: CSSProperties;
  issueCardDescription: CSSProperties;
  // New styles for Calendar View
  calendarContainer: CSSProperties;
  calendarHeader: CSSProperties;
  calendarNavButton: CSSProperties;
  calendarMonthYear: CSSProperties;
  calendarGrid: CSSProperties;
  calendarDayHeader: CSSProperties;
  calendarDay: CSSProperties;
  calendarDayHasTasks: CSSProperties;
  calendarDaySelected: CSSProperties;
  calendarTasksForDay: CSSProperties;
  calendarTaskItem: CSSProperties;
}

// Helper to format date as "Month Day" (e.g., "Dec 5")
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid date
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Helper to map numeric priority to string
const mapPriority = (priority: number): Priority => {
  if (priority >= 4) return 'High';
  if (priority >= 2) return 'Medium';
  return 'Low';
};

// Helper to map priority string to a numeric value for sorting
const getPriorityValue = (priority: Priority): number => {
  switch (priority) {
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': return 1;
    default: return 0;
  }
};

// New Component for Grid View Card
const ActiveIssueCard: React.FC<{
  issue: ActiveIssue;
  styles: ComponentStyles;
  getPriorityStyle: (priority: Priority) => CSSProperties;
  isExpanded: boolean;
  onToggleDescription: (id: string) => void;
  onCompleteTask: (id: string) => void; // Added onCompleteTask prop
}> = ({ issue, styles, getPriorityStyle, isExpanded, onToggleDescription, onCompleteTask }) => (
  <div style={styles.issueCard}>
    <div style={styles.issueCardHeader}>
      <h4 style={styles.issueCardTitle} onClick={() => onToggleDescription(issue.id)}>{issue.title}</h4>
      <span style={getPriorityStyle(issue.priority)}>{issue.priority}</span>
    </div>
    <div style={styles.issueCardDetails}>
      <span style={styles.issueCardDetailItem}><strong>Project:</strong> <span style={styles.projectTag}>{issue.project}</span></span>
      <span style={styles.issueCardDetailItem}><strong>Due:</strong> {issue.date}</span>
      <span style={styles.issueCardDetailItem}><strong>Assigned:</strong> {issue.userNameFallback}</span>
    </div>
    {isExpanded && (
      <p style={styles.issueCardDescription}>
        {issue.description || 'No description available.'}
      </p>
    )}
    <button
        style={{ ...styles.completeButton, marginTop: '10px', alignSelf: 'flex-end' }} // Added margin and alignSelf
        onClick={(e) => {
            e.stopPropagation(); // Prevent toggling description when clicking complete
            onCompleteTask(issue.id);
        }}
    >
        Complete
    </button>
  </div>
);

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
  const [developerMode, setDeveloperMode] = useState(false);

  // State for sorting
  const [sortColumn, setSortColumn] = useState<keyof ActiveIssue | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // New state for tracking expanded task ID
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Calendar View states
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [highlightedTasks, setHighlightedTasks] = useState<ActiveIssue[]>([]);

  // Function to toggle description visibility
  const toggleDescription = (taskId: string) => {
    setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
  };

  // Function to process a single task from Supabase payload
  const processSupabaseTask = useCallback((task: any, userEmail: string): ActiveIssue => {
    const commonTaskProps = {
        id: task.id || `task-${task.created_at}`,
        title: task.task_name || 'No title',
        description: task.description || 'No description',
        date: formatDate(task.due_date),
        originalDate: new Date(task.due_date),
        priority: mapPriority(task.priority),
        project: 'General', // Placeholder, as 'project' is not in the tasks table
        userNameFallback: userEmail.substring(0, 2).toUpperCase(),
    };
    return commonTaskProps;
  }, []);

  // Function to mark a task as complete
  const handleCompleteTask = async (taskId: string) => {
    console.log('Completing task with ID:', taskId);
    // Optimistically remove from UI
    setActiveIssues(prev => prev.filter(task => task.id !== taskId));
    setTodaysTasks(prev => prev.filter(task => task.id !== taskId));

    console.log("Attempting to complete task with ID:", taskId);
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    console.log("Current user ID:", userId); // Check this

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_complete: true })
        .eq('id', taskId)
        .eq('user_id', userId); // Explicitly add user_id filter if not relying solely on RLS for this.

      console.log("Supabase update response data:", data); // Should be empty array if no rows affected
      console.log("Supabase update error:", error); // Should be null if no DB error

      if (error) {
        console.error('Error updating task completion status:', error);
        return;
      }

      // ... (rest of the logic) ...
    } catch (error) {
      console.error('An unexpected error occurred while completing task:', error);
    }
  };

  // Sorting logic
  const handleSort = (column: keyof ActiveIssue) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setShowSortDropdown(false);
  };

  const sortedIssues = React.useMemo(() => {
    if (!sortColumn) return activeIssues;

    return [...activeIssues].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortColumn === 'priority') {
        valA = getPriorityValue(a.priority);
        valB = getPriorityValue(b.priority);
      } else if (sortColumn === 'date') {
        valA = a.originalDate.getTime(); // Use the Date object for accurate sorting
        valB = b.originalDate.getTime();
      } else {
        valA = a[sortColumn];
        valB = b[sortColumn];
      }

      if (valA === undefined || valB === undefined) return 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' ? (valA < valB ? -1 : 1) : (valB < valA ? -1 : 1);
      }
    });
  }, [activeIssues, sortColumn, sortDirection]);


  // Calendar navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday
  };

  const generateCalendarDays = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear); // 0 = Sunday, 1 = Monday
    const days: (number | null)[] = [];

    // Adjust firstDay to be 0 for Monday, 6 for Sunday
    const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null); // Placeholder for days before the 1st
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth, currentYear]);

  // Update highlighted tasks when selectedDate or activeIssues change
  useEffect(() => {
    if (selectedDate) {
      const tasks = activeIssues.filter(issue => {
        const issueDate = new Date(issue.originalDate);
        return issueDate.getFullYear() === selectedDate.getFullYear() &&
               issueDate.getMonth() === selectedDate.getMonth() &&
               issueDate.getDate() === selectedDate.getDate();
      });
      setHighlightedTasks(tasks);
    } else {
      setHighlightedTasks([]);
    }
  }, [selectedDate, activeIssues]);


  // Fetch tasks from Supabase and set up real-time listener
  useEffect(() => {
    let tasksChannel: any = null; // Initialize channel variable
    let currentUserEmail: string = ''; // To store user email for processing tasks

    const checkSessionAndFetchTasks = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        navigate('/login');
        return;
      }
      if (!session) {
        navigate('/login');
        return;
      }

      const userId = session.user?.id;
      currentUserEmail = session.user?.email || 'unknown'; // Store email
      if (!userId) {
        console.error('User ID not found in session.');
        navigate('/login');
        return;
      }

      // Fetch initial tasks where 'is_complete' is false
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_complete', false);

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to start of day

      const fetchedTodaysTasks: TodaysTask[] = [];
      const fetchedActiveIssues: ActiveIssue[] = [];

      tasks.forEach((task: any) => {
        const processedTask = processSupabaseTask(task, currentUserEmail); // Pass user email
        const taskDueDate = new Date(task.due_date);
        taskDueDate.setHours(0, 0, 0, 0);

        if (taskDueDate.getTime() === today.getTime() && !task.is_complete) {
          fetchedTodaysTasks.push({
            id: processedTask.id,
            text: processedTask.title,
            completed: task.is_complete,
          });
        }
        fetchedActiveIssues.push(processedTask);
      });

      setTodaysTasks(fetchedTodaysTasks);
      setActiveIssues(fetchedActiveIssues);

      // Set up real-time listener *after* fetching initial data and having userId
      if (userId) {
        tasksChannel = supabase.channel('tasks_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
              filter: `user_id=eq.${userId}` // Filter to only listen for current user's tasks
            },
            (payload) => {
              console.log('Task change received!', payload);

              const newOrUpdatedTask = payload.new;
              const oldTask = payload.old; // For DELETE events

              if (newOrUpdatedTask && newOrUpdatedTask.is_complete === false) { // Only care about incomplete tasks
                const processed = processSupabaseTask(newOrUpdatedTask, currentUserEmail);
                const todayForPayload = new Date();
                todayForPayload.setHours(0,0,0,0);
                const payloadDueDate = new Date(newOrUpdatedTask.due_date);
                payloadDueDate.setHours(0,0,0,0);

                if (payload.eventType === 'INSERT') {
                  setActiveIssues(prev => [...prev, processed]);
                  if (payloadDueDate.getTime() === todayForPayload.getTime()) {
                    setTodaysTasks(prev => [...prev, { id: processed.id, text: processed.title, completed: false }]);
                  }
                } else if (payload.eventType === 'UPDATE') {
                  setActiveIssues(prev => prev.map(task =>
                    task.id === processed.id ? processed : task
                  ));
                  // Handle today's tasks update
                  setTodaysTasks(prev => {
                    const existingTodayTask = prev.find(t => t.id === processed.id);
                    if (payloadDueDate.getTime() === todayForPayload.getTime()) {
                      if (!existingTodayTask) {
                        return [...prev, { id: processed.id, text: processed.title, completed: false }];
                      } else {
                        return prev.map(t => t.id === processed.id ? { ...t, text: processed.title } : t);
                      }
                    } else {
                      // If it's no longer for today, remove it from today's tasks
                      return prev.filter(t => t.id !== processed.id);
                    }
                  });
                }
              } else if (payload.eventType === 'DELETE' || (newOrUpdatedTask && newOrUpdatedTask.is_complete === true)) {
                const taskIdToRemove = newOrUpdatedTask ? newOrUpdatedTask.id : oldTask?.id;
                setActiveIssues(prev => prev.filter(task => task.id !== taskIdToRemove));
                setTodaysTasks(prev => prev.filter(task => task.id !== taskIdToRemove));
              }
            }
          )
          .subscribe();
      }
    };

    checkSessionAndFetchTasks();

    // Electron API listeners for Python script
    if (window.electronAPI) {
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
      // Unsubscribe from real-time changes when component unmounts
      if (tasksChannel) {
        supabase.removeChannel(tasksChannel);
      }
      // Clean up Electron listeners
      if (window.electronAPI) {
        window.electronAPI.removePythonStdoutListener();
        window.electronAPI.removePythonStderrListener();
        window.electronAPI.removePythonScriptCompleteListener();
        if (isScriptRunning) {
          console.log('Component unmounting, attempting to stop Python script...');
          window.electronAPI.stopPythonScript().catch(e => console.error('Error stopping script on unmount:', e));
        }
      }
    };

  }, [navigate, isScriptRunning, processSupabaseTask]); // Added processSupabaseTask to dependencies


  const runPythonScriptOnMount = useCallback(async () => {
    if (isScriptRunning) {
      console.warn("Python script is already running. Please wait or stop it first.");
      return;
    }

    setIsLoading(true);
    setIsScriptRunning(true);
    setPythonOutput('');
    setPythonError('');

    if (window.electronAPI) {
      try {
        console.log('Running Python script...');

        // Re-attach listeners every time the script is run to ensure they are active
        // and capture output for the current run.
        // It's generally better to set these up once in the main useEffect if they
        // are truly global listeners, but for a "run script" button, re-attaching
        // ensures a clean slate for output.
        // For this pattern, ensure `removePythonStdoutListener` etc. are called on unmount
        // to prevent multiple listeners. The useEffect cleanup handles this.

        const { data: { session } } = await supabase.auth.getSession();
        const msalToken: string = session?.provider_token || '';
        const accessToken: string = session?.access_token || '';
        const refreshToken: string = session?.refresh_token || '';
        await window.electronAPI.runPythonScript([accessToken, refreshToken, msalToken]);
        console.log('Python script execution initiated.');

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


  const handleLogout = useCallback(async () => {
    const { error: supabaseSignOutError } = await supabase.auth.signOut();

    if (supabaseSignOutError) {
      console.error('Error signing out of Supabase:', supabaseSignOutError);
    } else {
      console.log('Signed out of Supabase.');
    }

    const microsoftLogoutUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent('http://localhost:5173/login')}`;

    window.location.href = microsoftLogoutUrl;

  }, []);

  const styles: ComponentStyles = {
    appContainer: {
      display: 'flex',
      height: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#1E0A3C',
      color: '#E0E0E0',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#1E0A3C',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #3A1F5F',
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
      backgroundColor: '#2B124A',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    taskCheckbox: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      border: '2px solid #9575CD',
      backgroundColor: 'transparent',
      marginRight: '12px',
      display: 'inline-block',
    },
    taskText: {
      fontSize: '0.95rem',
      color: '#E0E0E0',
    },
    sidebarFooter: {
      display: 'flex',
      justifyContent: 'center', // Centered for the single logout button
      alignItems: 'center',
      padding: '20px 15px', // Adjusted padding for full width button
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
      backgroundColor: '#3A1F5F',
      padding: '25px 30px',
      overflowY: 'auto',
    },
    mainHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      position: 'relative', // For dropdown positioning
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
      width: '300px',
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
    sortButton: { // Renamed from filterButton
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
      position: 'relative', // For dropdown
    },
    sortDropdown: { // New style
        position: 'absolute',
        top: '100%', // Position below the button
        left: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 10,
        minWidth: '150px',
        marginTop: '5px',
    },
    sortDropdownItem: { // New style
        padding: '10px 15px',
        cursor: 'pointer',
        color: '#333',
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
      backgroundColor: '#2B124A',
      color: '#FFFFFF',
    },
    issuesTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 10px',
      backgroundColor: '#2B124A',
      borderRadius: '8px',
      padding: '10px',
    },
    tableHeaderRow: {
      textAlign: 'left',
      color: '#C0B9D1',
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    tableHeaderCell: {
      padding: '12px 15px',
      borderBottom: '2px solid #3A1F5F',
    },
    tableRow: {
      backgroundColor: '#2B124A',
      color: '#E0E0E0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tableCell: {
      padding: '15px 15px',
      borderBottom: '1px solid #3A1F5F',
      verticalAlign: 'middle',
    },
    projectTag: {
      backgroundColor: '#111',
      color: '#FFFFFF',
      padding: '4px 10px',
      borderRadius: '12px',
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
      backgroundColor: '#E91E63',
    },
    priorityTagMedium: {
      backgroundColor: '#AB47BC',
    },
    priorityTagLow: {
      backgroundColor: '#7E57C2',
    },
    userCell: {
      display: 'flex',
      alignItems: 'center',
    },
    actionCell: {
      textAlign: 'center',
    },
    completeButton: {
      padding: '8px 12px',
      backgroundColor: '#7E57C2',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
    },
    logoutButton: {
      padding: '10px 18px',
      backgroundColor: '#FFFFFF',
      color: '#333',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      width: '90%',
    },
    runScriptButton: {
      padding: '10px 18px',
      backgroundColor: '#9575CD',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginRight: '15px',
      opacity: isScriptRunning ? 0.6 : 1,
      pointerEvents: isScriptRunning ? 'none' : 'auto',
    },
    pythonOutputArea: {
      backgroundColor: '#111',
      color: '#00FF00',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      minHeight: '100px',
      maxHeight: '300px',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      fontFamily: 'monospace',
      border: '1px solid #3A1F5F',
    },
    pythonErrorArea: {
      backgroundColor: '#440000',
      color: '#FF0000',
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
    developerModeContainer: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '15px',
      color: '#E0E0E0',
    },
    developerModeCheckbox: {
      marginRight: '5px',
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    developerModeLabel: {
      fontSize: '0.9rem',
      cursor: 'pointer',
    },
    expandedDescriptionRow: {
      backgroundColor: '#3A1F5F', // A slightly different background for the expanded row
      color: '#E0E0E0',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #4A2B73',
    },
    expandedDescriptionCell: {
      padding: '15px 15px 20px 15px',
      fontSize: '0.9rem',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap', // Preserve line breaks
      gridColumn: '1 / -1', // Span across all columns in the table
    },
    // New styles for Grid View
    issuesGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '10px',
        justifyContent: 'flex-start',
    },
    issueCard: {
        backgroundColor: '#2B124A',
        borderRadius: '8px',
        padding: '20px',
        width: 'calc(33% - 20px)', // Three columns with gap
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
    },
    issueCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
    },
    issueCardTitle: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#FFFFFF',
        margin: 0,
        flexGrow: 1,
        marginRight: '10px',
        cursor: 'pointer', // Make title clickable to expand/collapse
    },
    issueCardDetails: {
        fontSize: '0.85rem',
        color: '#C0B9D1',
        marginBottom: '10px',
    },
    issueCardDetailItem: {
        display: 'block',
        marginBottom: '5px',
    },
    issueCardDescription: {
        fontSize: '0.9rem',
        color: '#E0E0E0',
        marginTop: '10px',
        borderTop: '1px solid #3A1F5F',
        paddingTop: '10px',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
    },
    // New styles for Calendar View
    calendarContainer: {
        backgroundColor: '#2B124A',
        borderRadius: '8px',
        padding: '20px',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
    },
    calendarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        color: '#FFFFFF',
    },
    calendarNavButton: {
        backgroundColor: '#3A1F5F',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    calendarMonthYear: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
    },
    calendarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '5px',
        textAlign: 'center',
        flexGrow: 1,
    },
    calendarDayHeader: {
        color: '#C0B9D1',
        fontWeight: 'bold',
        padding: '10px 0',
    },
    calendarDay: {
        backgroundColor: '#3A1F5F',
        padding: '10px 5px',
        borderRadius: '4px',
        cursor: 'pointer',
        aspectRatio: '1 / 1', // Make days square
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s',
        position: 'relative',
        border: '1px solid transparent',
        boxSizing: 'border-box',
    },
    calendarDayHasTasks: {
        border: '2px solid #9575CD',
        backgroundColor: '#4A2B73',
    },
    calendarDaySelected: {
        backgroundColor: '#7E57C2',
        borderColor: '#9575CD',
        color: '#FFFFFF',
    },
    calendarTasksForDay: {
        marginTop: '20px',
        backgroundColor: '#3A1F5F',
        borderRadius: '8px',
        padding: '15px',
    },
    calendarTaskItem: {
        backgroundColor: '#2B124A',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '0.9rem',
        color: '#E0E0E0',
    }
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
            <li
              key={task.id}
              style={styles.todaysTaskItem}
            >
              <span style={{
                ...styles.taskCheckbox,
                ...(task.completed ? { backgroundColor: '#7E57C2', borderColor: '#7E57C2' } : {})
              }}></span>
              <span style={styles.taskText}>{task.text}</span>
            </li>
          ))}
        </ul>
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
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
            <div style={{ position: 'relative' }}>
                <button
                    style={styles.sortButton}
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                    <SortIcon /> Sort By
                </button>
                {showSortDropdown && (
                    <div style={styles.sortDropdown}>
                        <div
                            style={styles.sortDropdownItem}
                            onClick={() => handleSort('title')}
                        >
                            Name {sortColumn === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </div>
                        <div
                            style={styles.sortDropdownItem}
                            onClick={() => handleSort('priority')}
                        >
                            Priority {sortColumn === 'priority' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </div>
                        <div
                            style={styles.sortDropdownItem}
                            onClick={() => handleSort('date')}
                        >
                            Deadline {sortColumn === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </div>
                    </div>
                )}
            </div>
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
          {/* Developer Mode Checkbox */}
          <div style={styles.developerModeContainer}>
            <input
              type="checkbox"
              id="developerMode"
              checked={developerMode}
              onChange={(e) => setDeveloperMode(e.target.checked)}
              style={styles.developerModeCheckbox}
            />
            <label htmlFor="developerMode" style={styles.developerModeLabel}>Developer Mode</label>
          </div>

          {/* New Button to Run Python Script */}
          <button
            onClick={runPythonScriptOnMount}
            style={styles.runScriptButton}
            disabled={isLoading || isScriptRunning}
          >
            {isLoading || isScriptRunning ? 'LiDIA is Running...' : 'Run LiDIA'}
          </button>
        </div>

        {/* Python Script Output Area - Conditionally rendered based on developerMode */}
        {developerMode && pythonOutput && (
          <div>
            <h3>Python Output:</h3>
            <pre style={styles.pythonOutputArea}>{pythonOutput}</pre>
          </div>
        )}
        {developerMode && pythonError && (
          <div>
            <h3>Python Errors:</h3>
            <pre style={styles.pythonErrorArea}>{pythonError}</pre>
          </div>
        )}

        {activeView === 'list' && (
          <table style={styles.issuesTable}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{...styles.tableHeaderCell, width: '35%'}}>Title</th>
                <th style={{...styles.tableHeaderCell, width: '15%'}}>Project</th>
                <th style={{...styles.tableHeaderCell, width: '15%'}}>Priority</th>
                <th style={{...styles.tableHeaderCell, width: '10%'}}>Date</th>
                <th style={{...styles.tableHeaderCell, width: '10%'}}>User</th>
                <th style={{...styles.tableHeaderCell, width: '15%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedIssues // Use sortedIssues here
                .filter(issue => issue.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(issue => (
                <React.Fragment key={issue.id}>
                  <tr style={styles.tableRow} >
                    <td style={styles.tableCell} onClick={() => toggleDescription(issue.id)}>{issue.title}</td>
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
                      <button
                        style={styles.completeButton}
                        onClick={() => handleCompleteTask(issue.id)}
                      >
                        Complete
                      </button>
                    </td>
                  </tr>
                  {expandedTaskId === issue.id && (
                    <tr style={styles.expandedDescriptionRow}>
                      <td colSpan={6} style={styles.expandedDescriptionCell}>
                        <b>Description:</b><br />{issue.description || 'No description available.'}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {activeView === 'grid' && (
            <div style={styles.issuesGrid}>
                {sortedIssues // Use sortedIssues here
                    .filter(issue => issue.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(issue => (
                    <ActiveIssueCard
                        key={issue.id}
                        issue={issue}
                        styles={styles}
                        getPriorityStyle={getPriorityStyle}
                        isExpanded={expandedTaskId === issue.id}
                        onToggleDescription={toggleDescription}
                        onCompleteTask={handleCompleteTask} // Pass the handler to the card
                    />
                ))}
            </div>
        )}

        {activeView === 'calendar' && (
            <div style={styles.calendarContainer}>
                <div style={styles.calendarHeader}>
                    <button onClick={goToPreviousMonth} style={styles.calendarNavButton}>&lt;</button>
                    <h3 style={styles.calendarMonthYear}>
                        {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={goToNextMonth} style={styles.calendarNavButton}>&gt;</button>
                </div>
                <div style={styles.calendarGrid}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} style={styles.calendarDayHeader}>{day}</div>
                    ))}
                    {generateCalendarDays().map((day, index) => {
                        const date = day ? new Date(currentYear, currentMonth, day) : null;
                        const hasTasks = date ? activeIssues.some(issue => {
                            const issueDate = new Date(issue.originalDate);
                            return issueDate.getFullYear() === date.getFullYear() &&
                                   issueDate.getMonth() === date.getMonth() &&
                                   issueDate.getDate() === date.getDate();
                        }) : false;
                        const isSelected = selectedDate && date &&
                                           selectedDate.getFullYear() === date.getFullYear() &&
                                           selectedDate.getMonth() === date.getMonth() &&
                                           selectedDate.getDate() === date.getDate();

                        return (
                            <div
                                key={index}
                                style={{
                                    ...styles.calendarDay,
                                    ...(day === null ? { visibility: 'hidden' } : {}),
                                    ...(hasTasks ? styles.calendarDayHasTasks : {}),
                                    ...(isSelected ? styles.calendarDaySelected : {}),
                                }}
                                onClick={() => day && setSelectedDate(date)}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
                {selectedDate && highlightedTasks.length > 0 && (
                    <div style={styles.calendarTasksForDay}>
                        <h4>Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}:</h4>
                        {highlightedTasks.map(task => (
                            <div key={task.id} style={styles.calendarTaskItem}>
                                <strong>{task.title}</strong> - {task.priority} Priority
                                {task.description && <p style={{ margin: '5px 0 0', fontSize: '0.8rem' }}>{task.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
                {selectedDate && highlightedTasks.length === 0 && (
                    <div style={styles.calendarTasksForDay}>
                        <h4>No tasks for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</h4>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;