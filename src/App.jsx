// src/App.jsx
import { useState, useEffect } from 'react'; // Import useEffect
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Test from './pages/Test';
import TestDetail from './pages/TestDetail';
import { auth } from './firebase'; // Import auth from your firebase.js

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  // Use useEffect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false); // Authentication state is determined, stop loading
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // Display a loading indicator while Firebase initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] text-white text-xl">
        Cargando autenticación...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route for authentication */}
      {/* If user is logged in, redirect from /auth to /dashboard */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <Auth onUser={setUser} />}
      />

      {/* Protected Routes */}
      {/* If no user, redirect to /auth */}
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/dashboard/:id"
        element={user ? <TestDetail /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/test"
        element={user ? <Test /> : <Navigate to="/auth" replace />}
      />

      {/* Default redirect for unmatched paths */}
      {/* If a user is logged in, default to dashboard. Otherwise, default to auth. */}
      <Route
        path="*"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />}
      />
    </Routes>
  );
}

