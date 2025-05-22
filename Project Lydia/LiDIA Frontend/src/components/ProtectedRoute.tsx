// You can put this in src/components/ProtectedRoute.tsx or directly in main.tsx/App.tsx as shown above
// (If in a separate file, import it)

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../main'; // Adjust path if supabase client is elsewhere
                                     // or pass supabase as a prop
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionData = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    };

    getSessionData();

    // Listen for auth changes to update session state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      // Optional: if user signs out while on a protected route, you might want to setLoading(false) too
      // if (_event === 'SIGNED_OUT') setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading session...</div>; // Or a spinner component
  }

  if (!session) {
    // User not logged in, redirect to login page
    // 'replace' avoids adding the current (protected) URL to history
    // 'state' can be used to pass the intended destination after login
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // User is logged in, render the requested component
  return children;
};

export default ProtectedRoute;