// src/components/Auth.jsx
import { useState, useEffect } from "react";
import { auth }            from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

export default function Auth({ onUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      onUser(user);
    });
    return unsubscribe;
  }, [onUser]);

  return (
    <div>
      <h2>{isRegister ? "Regístrate" : "Inicia Sesión"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">{isRegister ? "Registrarse" : "Entrar"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "¿Ya tienes cuenta? Entra" : "¿No tienes cuenta? Regístrate"}
      </button>
      {auth.currentUser && (
        <button onClick={() => signOut(auth)}>Cerrar Sesión</button>
      )}
    </div>
  );
}
