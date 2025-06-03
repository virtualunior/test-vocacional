// src/components/Auth.jsx
import { useState, useEffect } from "react"
import { auth, db } from "../firebase" // Import 'auth' and 'db' from firebase.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { signInWithGoogle } from "../firebase" // Import signInWithGoogle from firebase.js
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaCalendarAlt, FaExclamationCircle, FaPhone  } from "react-icons/fa"

export default function Auth({ onUser }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsAdditionalInfo, setNeedsAdditionalInfo] = useState(false)
  const [googleUser, setGoogleUser] = useState(null)
  const navigate = useNavigate()
  const [phone, setPhone] = useState("") // Agrega esto con los otros estados

  // Generate birth year options (for users between 14 and 70 years old)
  const currentYear = new Date().getFullYear()
  const birthYearOptions = []
  for (let year = currentYear - 70; year <= currentYear - 14; year++) {
    birthYearOptions.push(year)
  }

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed:", user ? user.email : "No user");

    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists() || !userDoc.data().birthYear) {
          console.log("User needs additional info. Setting needsAdditionalInfo to true.");
          setNeedsAdditionalInfo(true);
          if (user.providerData[0].providerId === "google.com") {
            setGoogleUser(user);
          }
        } else {
          console.log("User has complete profile. Setting needsAdditionalInfo to false.");
          setNeedsAdditionalInfo(false);
          onUser(user);
          if (window.location.pathname === "/auth" || window.location.pathname === "/") {
            navigate("/dashboard");
          }
        }
      } catch (err) {
        console.error("Error checking user data in useEffect:", err);
        if (user.providerData[0].providerId === "google.com") {
          console.log("Error fetching user doc, assuming Google user needs additional info.");
          setGoogleUser(user);
          setNeedsAdditionalInfo(true);
        } else {
          onUser(user);
        }
      }
    } else {
      // No user is signed in
      console.log("No user detected, redirecting to auth");
      onUser(null);
      setNeedsAdditionalInfo(false);
      setGoogleUser(null);
      
      // AGREGAR ESTA NAVEGACIÓN
      if (window.location.pathname !== "/auth") {
        navigate("/auth", { replace: true });
      }
    }
  });

  return unsubscribe;
}, [onUser, navigate]);

  const validateForm = () => {
    if (isRegister) {
      if (!name.trim()) {
        setError("Por favor ingresa tu nombre completo")
        return false
      }
      if (!birthYear) {
        setError("Por favor selecciona tu año de nacimiento")
        return false
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        return false
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)
    try {
      if (isRegister) {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile with name
        await updateProfile(user, {
          displayName: name,
        })

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          birthYear: Number.parseInt(birthYear),
          registrationDate: new Date(),
        })

        // Navigate to test page
        navigate("/test")
      } else {
        // Sign in with email and password
        await signInWithEmailAndPassword(auth, email, password)
        navigate("/dashboard") // Navigate to dashboard after login
      }
    } catch (err) {
      console.error("Auth error:", err)
      setError(
        err.code === "auth/email-already-in-use"
          ? "Este correo ya está registrado. Intenta iniciar sesión."
          : err.code === "auth/invalid-credential"
            ? "Correo o contraseña incorrectos"
            : err.message,
      )
    } finally {
      setLoading(false)
    }
  }

 
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Si no existe, preparar para pedir información adicional
        setGoogleUser(user);
        setNeedsAdditionalInfo(true);
      }
      // Si existe, el listener onAuthStateChanged manejará la navegación
    } catch (err) {
      console.error("Google login error:", err);
      setError("Error al iniciar sesión con Google. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdditionalInfoSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Validación del año de nacimiento
    if (!birthYear) {
      setError("Por favor selecciona tu año de nacimiento");
      return;
    }
  
    // Validación opcional del teléfono (si se ingresó)
    if (phone && !/^[0-9]{7,15}$/.test(phone)) {
      setError("Por favor ingresa un número de teléfono válido (solo números, 7-15 dígitos)");
      return;
    }
  
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
  
      // Crear el objeto con los datos a guardar
      const userData = {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        birthYear: Number(birthYear),
        phone: phone || null,
        photoURL: user.photoURL || null,
        provider: "google.com",
        createdAt: new Date(),
        lastLogin: new Date(),
        updatedAt: new Date()
      };
  
      console.log("Intentando guardar:", userData); // Para depuración
  
      // Guardar en Firestore
      await setDoc(doc(db, "users", user.uid), userData, { merge: true });
  
      console.log("Datos guardados exitosamente"); // Para depuración
      
      // Redirigir y actualizar estado
      setNeedsAdditionalInfo(false);
      onUser(user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error detallado:", err); // Más detalles del error
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If we need to collect additional information after Google login
  if (needsAdditionalInfo && auth.currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Un último paso</h2>
            <p className="text-gray-600 mt-2">
              Necesitamos tu año de nacimiento para personalizar tu experiencia en el test vocacional
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex items-center">
                <FaExclamationCircle className="text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAdditionalInfoSubmit} className="space-y-6">
            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
                Año de nacimiento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <select
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                >
                  <option value="">Selecciona tu año de nacimiento</option>
                  {birthYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Nuevo campo para teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Ingresa tu número de teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-[#db1f26] to-[#660915] hover:from-[#c01e24] hover:to-[#5a0812] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#db1f26] font-medium transition-colors"
            >
              {loading ? "Procesando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="unior-icon.webp" alt="Unior Icon" class="w-16 h-16 rounded-lg"/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Universidad Privada de Oruro</h1>
          <p className="text-gray-600 mt-2">Sistema de Orientación Vocacional</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {isRegister ? "Crear una cuenta" : "Iniciar sesión"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex items-center">
                <FaExclamationCircle className="text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div>
                <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Año de nacimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <select
                    id="birthYear"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    required={isRegister}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                  >
                    <option value="">Selecciona tu año de nacimiento</option>
                    {birthYearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder={isRegister ? "Crea una contraseña" : "Ingresa tu contraseña"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                />
              </div>
              {isRegister && <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>}
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isRegister}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#db1f26] focus:border-[#db1f26] bg-white text-gray-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-[#db1f26] to-[#660915] hover:from-[#c01e24] hover:to-[#5a0812] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#db1f26] font-medium transition-colors"
            >
              {loading ? "Procesando..." : isRegister ? "Registrarse" : "Iniciar sesión"}
            </button>
          </form>

          {/* Separator Line */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">O</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#db1f26] transition-colors"
          >
            <FaGoogle className="text-[#4285F4]" />
            Continuar con Google
          </button>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setError("")
              }}
              className="text-[#db1f26] hover:text-[#660915] text-sm font-medium transition-colors"
            >
              {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </div>

        {/* Terms and Privacy */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="text-[#db1f26] hover:underline">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="text-[#db1f26] hover:underline">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  )
}