// src/components/UserProfile.jsx
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { logout } from '../firebase';

export default function UserProfile() {
  const user = auth.currentUser; // This gets the current user from Firebase's internal state
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth'); // Redirect to the authentication page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return null; // Don't render if no user is found

  return (
    <div className="flex items-center gap-3">
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt="User"
          className="w-8 h-8 rounded-full"
        />
      )}
      <span className="text-sm text-white">{user.displayName || user.email}</span> {/* Added text-white for visibility */}
      <button
        onClick={handleLogout}
        className="text-sm text-blue-300 hover:text-blue-500 transition" // Adjusted text color
      >
        Cerrar sesión
      </button>
    </div>
  );
}