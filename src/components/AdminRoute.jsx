import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // Suponemos que el usuario tiene un campo 'role'. Si no, solo permitir admins explícitos.
  if (!user) {
    // No autenticado
    return <Navigate to="/auth" replace />;
  }
  if (user.role !== 'admin') {
    // No es admin
    return <Navigate to="/dashboard" replace />;
  }
  // Es admin
  return children;
} 