// src/main.tsx
import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage'; // Assuming you have a DashboardPage component
import ProtectedRoute from './components/ProtectedRoute'; // Assuming you put it here
import { createClient } from '@supabase/supabase-js'; // Import Session type
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import type { AuthenticationResult } from '@azure/msal-browser';

export const supabase = createClient(
  'https://fvimixatbauakyxkkchz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aW1peGF0YmF1YWt5eGtrY2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NjMzMzEsImV4cCI6MjA1OTQzOTMzMX0.unBc3G37y1AfbmtnHgm5A-i-RvVLvKEHORkAg19izoQ',
);

export async function acquireMsalToken(): Promise<string> {
  let accessToken: string = "";

  const pca = new PublicClientApplication({
    auth: {
      clientId: '5bbdc0bb-c9fe-4372-9175-f3677f9e55c6', // Replace with your actual client ID
      authority: 'https://login.microsoftonline.com/ad5ba4a2-7857-4ea1-895e-b3d5207a174f', // Replace with your actual authority
      redirectUri: 'http://localhost:5173', // Replace with your actual redirect URI
    },
  });

  let scopes = ["Chat.Read", "User.Read"]

  await pca.initialize()

  try {
    // 1. Try to get an account silently (e.g., from cache)
    const accounts = pca.getAllAccounts();
    if (accounts.length > 0) {
      console.log("Found existing accounts. Attempting silent token acquisition.");
      // Attempt silent acquisition for the first account found
      const silentResult: AuthenticationResult = await pca.acquireTokenSilent({
        scopes: scopes,
        account: accounts[0], // Use the first account found
      });
      accessToken = silentResult.accessToken;
      console.log("Silent access token acquired successfully.");
    } else {
      console.log("No existing accounts found. Proceeding to interactive acquisition.");
    }
  } catch (error) {
    // Check if the error is due to interaction being required (e.g., token expired, consent needed)
    if (error instanceof InteractionRequiredAuthError) {
      console.warn("Silent token acquisition failed, interaction required. Falling back to interactive login.");
    } else {
      console.error("Error during silent token acquisition, returning empty string:", error);
      // If it's another type of error, we might not want to proceed with interactive
      return "";
    }
  }

  // 2. If no token was acquired silently (or silent failed with InteractionRequiredAuthError),
  //    proceed with interactive acquisition.
  if (accessToken === "") {
    try {
      // Now, try to acquire the token
      const interactiveResult: AuthenticationResult = await pca.acquireTokenPopup({
        scopes: scopes,
      });
      accessToken = interactiveResult.accessToken;

      if (accessToken) {
        console.log("Final acquired token:", accessToken);
        // You can now use this 'token' for API calls
        // For example, pass it to your backend or use it with Microsoft Graph SDK
      } else {
        console.log("Failed to acquire an access token.");
      }
      console.log("Interactive access token acquired successfully.");
    } catch (interactiveError) {
      console.error("Error during interactive token acquisition, returning empty string:", interactiveError);
      // Handle interactive errors (e.g., user closes popup, consent denied)
      return "";
    }
  }

  return accessToken;
}


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