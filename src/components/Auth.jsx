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
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa"

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

  // Generate birth year options (for users between 14 and 70 years old)
  const currentYear = new Date().getFullYear()
  const birthYearOptions = []
  for (let year = currentYear - 70; year <= currentYear - 14; year++) {
    birthYearOptions.push(year)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.email : "No user")

      if (user) {
        // Check if we need to collect additional info for this user
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (!userDoc.exists() || !userDoc.data().birthYear) {
            // User exists but doesn't have birthYear - need additional info
            console.log("User needs additional info")
            setGoogleUser(user)
            setNeedsAdditionalInfo(true)
          } else {
            // User has complete profile
            console.log("User has complete profile")
            setNeedsAdditionalInfo(false)
            onUser(user)
          }
        } catch (err) {
          console.error("Error checking user data:", err)
          // If there's an error, we'll assume we need additional info
          if (user.providerData[0].providerId === "google.com") {
            setGoogleUser(user)
            setNeedsAdditionalInfo(true)
          } else {
            onUser(user)
          }
        }
      } else {
        // No user is signed in
        onUser(null)
      }
    })

    return unsubscribe
  }, [onUser])

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
    setError("") // Clear previous errors
    setLoading(true)
    try {
      // Call the exported function to sign in with Google
      const result = await signInWithGoogle()
      console.log("Google login successful, checking if user needs additional info")

      // The user is now logged in, but we'll check if they need to provide birth year
      // This will be handled by the useEffect with onAuthStateChanged
    } catch (err) {
      console.error("Google login error:", err)
      setError("Error al iniciar sesión con Google. Intenta nuevamente.")
      setLoading(false)
    }
  }

  const handleAdditionalInfoSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!birthYear) {
      setError("Por favor selecciona tu año de nacimiento")
      return
    }

    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No hay usuario autenticado")
      }

      // Store additional user data in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email,
          birthYear: Number.parseInt(birthYear),
          registrationDate: new Date(),
          photoURL: user.photoURL || null,
        },
        { merge: true },
      ) // Use merge to avoid overwriting existing data

      // Continue with normal flow
      setNeedsAdditionalInfo(false)
      onUser(user)
      navigate("/test")
    } catch (err) {
      console.error("Error saving additional info:", err)
      setError("Error al guardar información. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

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
            <div className="w-16 h-16 bg-gradient-to-br from-[#db1f26] to-[#660915] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">UPO</span>
            </div>
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