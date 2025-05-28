import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function ProtectedRoute({ children }) {
  if (!auth.currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}