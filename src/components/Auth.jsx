// src/components/Auth.jsx
import { useState, useEffect } from "react";
import { auth } from "../firebase"; // Import 'auth' from firebase.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  // We no longer need GoogleAuthProvider or signInWithPopup directly here,
  // as we'll use the function exported from firebase.js
  signOut
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase"; // Import signInWithGoogle from firebase.js

export default function Auth({ onUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => onUser(user));
    return unsubscribe;
  }, [onUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError(""); // Clear previous errors
    try {
      await signInWithGoogle(); // Call the exported function
      navigate('/test'); // Redirect after successful login
    } catch (err) {
      // The signInWithGoogle function already logs the error,
      // but we set it here for display in the UI
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] p-4">
      {/* Logo or Title */}
      <img src="/logo-unior.webp" alt="UniOr Logo" className="w-24 h-auto mb-8 sm:w-32 md:w-40 lg:w-48" />

      {/* Error Message */}
      {error && <p className="mb-4 text-center text-red-300">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 px-4 bg-gray-100 placeholder-gray-700 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full h-12 px-4 bg-gray-100 placeholder-gray-700 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          className="w-full h-12 bg-gradient-to-br from-[#db1f26] to-[#660915] text-white rounded-full font-semibold hover:opacity-90 transition"
        >
          {isRegister ? "Registrarse" : "Ingresar"}
        </button>
      </form>

      {/* Separator Line */}
      <div className="w-full max-w-sm flex items-center justify-center my-6">
        <div className="flex-grow border-t border-gray-400"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">O</span>
        <div className="flex-grow border-t border-gray-400"></div>
      </div>

      {/* Google Sign-In Button */}
      <div className="w-full max-w-sm">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="h-5 w-5"
          />
          Continuar con Google
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-300 text-center">
          {error}
        </p>
      )}

      <p className="mt-6 text-xs text-gray-300 text-center">
        Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
      </p>

      {/* Links */}
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-gray-200 text-sm hover:underline"
        >
          {isRegister ? "¿Ya tienes cuenta? Ingresar" : "¿No tienes cuenta? Crear Cuenta"}
        </button>
      </div>
    </div>
  );
}