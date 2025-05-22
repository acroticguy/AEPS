// src/main.tsx
import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage'; // Assuming you have a DashboardPage component
import ProtectedRoute from './components/ProtectedRoute'; // Assuming you put it here
import { createClient } from '@supabase/supabase-js'; // Import Session type

export const supabase = createClient(
  'https://fvimixatbauakyxkkchz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aW1peGF0YmF1YWt5eGtrY2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NjMzMzEsImV4cCI6MjA1OTQzOTMzMX0.unBc3G37y1AfbmtnHgm5A-i-RvVLvKEHORkAg19izoQ'
);

// ...
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/questionnaire"
          element={
            <ProtectedRoute>
              <QuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard" // <-- Add route for dashboard
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/questionnaire" replace />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);