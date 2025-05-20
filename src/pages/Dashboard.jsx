// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { db, auth }                   from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import Results from '../components/Results';

export default function Dashboard() {
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchAll = async () => {
      try {
        const q = query(
          collection(db, 'results'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('date', 'desc')
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({
          id:      doc.id,
          date:    doc.data().date.toDate(),
          answers: doc.data().answers
        }));
        setTests(items);
      } catch (err) {
        console.error('Error leyendo tests:', err);
        setError('No se pudieron cargar tus tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Cargando tus tests…</p>;
  if (error)   return <p style={{ padding: 20, color: 'red' }}>{error}</p>;
  if (tests.length === 0) {
    return <p style={{ padding: 20 }}>Aún no has completado ningún test.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Historial de Tests</h1>

      {/* Lista de tests */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tests.map(t => (
          <li key={t.id} style={{ marginBottom: 8 }}>
            <button
              style={{
                background: 'none',
                border: '1px solid #ccc',
                padding: '6px 12px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => setSelected(t)}
            >
              {t.date.toLocaleString()}
            </button>
          </li>
        ))}
      </ul>

      {/* Detalle del test seleccionado */}
      {selected && (
        <div style={{ marginTop: 30 }}>
          <h2>Resultados del test de {selected.date.toLocaleString()}</h2>
          <Results answers={selected.answers} />
        </div>
      )}
    </div>
  );
}

