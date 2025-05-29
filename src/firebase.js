// src/firebase.js
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Configuración mejorada del proveedor de Google
export const googleProvider = new GoogleAuthProvider()
// Solicitar acceso al perfil y email del usuario
googleProvider.addScope("profile")
googleProvider.addScope("email")
// Solicitar selección de cuenta para evitar login automático con la última cuenta
googleProvider.setCustomParameters({ prompt: "select_account" })

// Función mejorada para login con Google
export const signInWithGoogle = async () => {
  try {
    console.log("Iniciando login con Google...")
    const result = await signInWithPopup(auth, googleProvider)
    console.log("Login con Google exitoso:", result.user.email)
    return result.user
  } catch (error) {
    console.error("Error en Google Sign-In:", error.code, error.message)
    // Mensajes de error más descriptivos
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Ventana de login cerrada. Por favor intenta nuevamente.")
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("Solicitud cancelada. Por favor intenta nuevamente.")
    } else {
      throw error
    }
  }
}

// Función mejorada para logout
export const logout = async () => {
  console.log("Iniciando proceso de logout...")
  try {
    // Esperar explícitamente a que se complete el signOut
    await signOut(auth)
    console.log("Logout completado exitosamente")
    // Limpiar cualquier dato de sesión local si es necesario
    return true
  } catch (error) {
    console.error("Error al cerrar sesión:", error.code, error.message)
    throw error
  }
}

// Función para verificar el estado de autenticación actual
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}