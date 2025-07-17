// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Test from './pages/Test';
import TestDetail from './pages/TestDetail';

export default function App() {
  const { user, loading, needsAdditionalInfo } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 border-b-2 border-[#db1f26] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar componente de Auth
  if (!user) {
    return <Auth />;
  }

  // Si el usuario necesita información adicional, el componente Auth lo manejará
  if (needsAdditionalInfo) {
    return <Auth />;
  }

  // Una vez logueado, habilitamos las rutas
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/:id" element={<TestDetail />} />
      <Route path="/test" element={<Test />} />
      {/* Redirigir a /dashboard por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

