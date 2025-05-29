// src/App.jsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth      from './components/Auth';
import Dashboard from './pages/Dashboard';
import Test      from './pages/Test';
import TestDetail from './pages/TestDetail'

export default function App() {
  // Estado para saber si hay un usuario logueado
  const [user, setUser] = useState(null);

  // Mientras no tengamos usuario, mostramos el componente de Auth
  if (!user) {
    return <Auth onUser={setUser} />;
  }

  // Una vez logueado, habilitamos las rutas
  return (
    <Routes>
      <Route path="/dashboard"      element={<Dashboard />} />
      <Route path="/dashboard/:id"  element={<TestDetail />} />
      <Route path="/test" element={<Test />} />
      {/* Redirigir a /dashboard por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

