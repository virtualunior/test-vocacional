// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Asegúrate de importar db
import { auth, db } from '../firebase'; // Corregir la importación

const AuthContext = createContext();

// Eliminar la lista ADMIN_EMAILS

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para manejar el estado inicial de carga
    const [needsAdditionalInfo, setNeedsAdditionalInfo] = useState(false);
    const [googleUser, setGoogleUser] = useState(null); // Si necesitas esto

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed (AuthContext):", user ? user.email : "No user");
            if (user) {
                try {
                    // Obtener el documento del usuario en Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    let role = 'user';
                    if (userDocSnap.exists() && userDocSnap.data().role) {
                        role = userDocSnap.data().role;
                    }
                    setUser({ ...user, role });

                    if (!userDocSnap.exists() || !userDocSnap.data().birthYear) {
                        console.log("User needs additional info. Setting needsAdditionalInfo to true (AuthContext).");
                        setNeedsAdditionalInfo(true);
                        if (user.providerData[0].providerId === "google.com") {
                            setGoogleUser(user);
                        }
                    } else {
                        console.log("User has complete profile. Setting needsAdditionalInfo to false (AuthContext).");
                        setNeedsAdditionalInfo(false);
                        // Determinar si es admin
                        // Eliminar la lista ADMIN_EMAILS
                        setGoogleUser(null);
                    }
                } catch (err) {
                    console.error("Error checking user data in AuthContext useEffect:", err);
                    if (user.providerData[0].providerId === "google.com") {
                        console.log("Error fetching user doc, assuming Google user needs additional info (AuthContext).");
                        setGoogleUser(user);
                        setNeedsAdditionalInfo(true);
                        setUser(user); // Si hay error, asumimos que al menos el usuario existe y lo seteamos
                    } else {
                        setUser(user);
                    }
                }
            } else {
                // No user is signed in
                console.log("No user detected (AuthContext).");
                setUser(null);
                setNeedsAdditionalInfo(false);
                setGoogleUser(null);
            }
            setLoading(false); // Una vez que el estado inicial se ha determinado
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []); // Dependencias vacías para que se ejecute solo una vez al montar

    // Función de logout que se puede usar en cualquier componente
    const logout = async () => {
        try {
            console.log("Iniciando signOut desde AuthContext...");
            await signOut(auth);
            console.log("signOut completado (AuthContext).");
        } catch (error) {
            console.error("Error during signOut (AuthContext):", error);
        }
    };

    // Puedes exportar el estado de carga para mostrar un spinner mientras Firebase se inicializa
    const value = {
        user,
        loading,
        needsAdditionalInfo,
        googleUser,
        logout, // La función de logout
        setUser, // Si necesitas setear el usuario desde fuera del listener
        setNeedsAdditionalInfo,
        setGoogleUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Renderiza los hijos solo cuando la autenticación ha cargado */}
            {loading && <div>Cargando autenticación...</div>} {/* O un spinner/loading screen */}
        </AuthContext.Provider>
    );
};

// Custom hook para consumir el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};