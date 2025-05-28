// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import Results from '../components/Results';
import UserProfile from '../components/UserProfile';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Dashboard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Only fetch if a user is logged in
    if (!auth.currentUser) {
      setLoading(false); // If no user, stop loading immediately
      return;
    }

    const fetchAllTests = async () => {
      try {
        const q = query(
          collection(db, 'results'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('date', 'desc')
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({
          id: doc.id,
          date: doc.data().date.toDate(),
          answers: doc.data().answers
        }));
        setTests(items);
        // Automatically select the most recent test if available
        if (items.length > 0) {
          setSelected(items[0]);
        }
      } catch (err) {
        console.error('Error al leer los tests:', err);
        setError('No se pudieron cargar tus tests. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTests();
  }, [auth.currentUser]);

  const handleStartNewTest = () => {
    navigate('/test'); // Navigate to the /test route
  };

  // --- Loading, Error, and Empty States ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] text-white p-4">
        <p className="text-lg animate-pulse">Cargando tus tests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] p-4 text-red-300">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  // --- Main Dashboard Layout ---
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#db1f26] to-[#660915] text-white">
      {/* Header and User Profile */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Tu Historial de Tests</h1>
        <UserProfile />
      </div>

      {/* Button to Start New Test */}
      <button
        onClick={handleStartNewTest}
        className="bg-yellow-400 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-full shadow-lg mb-8 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"
      >
        Realizar Nuevo Test Vocacional
      </button>

      {/* Content Area */}
      <div className="w-full max-w-4xl bg-white bg-opacity-10 rounded-lg shadow-xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 text-gray-800">

        {/* List of Tests (Left/Top Section) */}
        <div className="md:w-1/3 p-4 bg-white bg-opacity-5 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-600 pb-2">Tests Realizados</h2>
          {tests.length === 0 ? (
            <p className="text-gray-300 text-center py-4">Aún no has completado ningún test.</p>
          ) : (
            <ul className="space-y-3">
              {tests.map(testItem => (
                <li key={testItem.id}>
                  <button
                    onClick={() => setSelected(testItem)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ease-in-out
                      ${selected && selected.id === testItem.id
                        ? 'bg-white bg-opacity-20 border border-white text-gray-800 shadow-md'
                        : 'bg-white bg-opacity-5 border border-gray-700 text-gray-600 hover:bg-opacity-10 hover:border-gray-500'
                      }`}
                  >
                    <span className="font-medium">Test de {testItem.date.toLocaleDateString()}</span>
                    <br />
                    <span className="text-xs text-gray-600">{testItem.date.toLocaleTimeString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail of Selected Test (Right/Bottom Section) */}
        <div className="md:w-2/3 p-4 bg-white bg-opacity-5 rounded-lg">
          {selected ? (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-600 pb-2">
                Resultados del test del {selected.date.toLocaleDateString()} a las {selected.date.toLocaleTimeString()}
              </h2>
              <Results answers={selected.answers} />
            </div>
          ) : (
            <div className="text-center py-10 text-gray-300">
              <p className="text-lg mb-2">Selecciona un test de la lista para ver sus resultados.</p>
              <p className="text-sm">Si no hay tests, completa uno para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

