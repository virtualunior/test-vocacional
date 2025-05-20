// src/pages/TestDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import { db, auth }                     from '../firebase';
import { doc, getDoc }                  from 'firebase/firestore';
import Results                          from '../components/Results';

export default function TestDetail() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [answers, setAnswers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    // Si no hay usuario logueado, redirige a login
    if (!auth.currentUser) {
      navigate('/');
      return;
    }

    const fetchTest = async () => {
      try {
        const ref   = doc(db, 'results', id);
        const snap  = await getDoc(ref);

        if (!snap.exists()) {
          setError('Test no encontrado.');
        } else if (snap.data().userId !== auth.currentUser.uid) {
          setError('No tienes permiso para ver este test.');
        } else {
          setAnswers(snap.data().answers);
        }
      } catch (err) {
        console.error('Error cargando test:', err);
        setError('Error al cargar el test.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id, navigate]);

  if (loading) {
    return <p style={{ padding: 20 }}>Cargando test…</p>;
  }
  if (error) {
    return <p style={{ padding: 20, color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Resultados del Test ID: {id}</h1>
      <Results answers={answers} />
    </div>
  );
}
