import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const CATEGORIES = ['EXPLORADOR', 'HACEDOR', 'COMUNICADOR', 'ORGANIZADOR', 'CREATIVO'];

export default function QuestionsManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ text: '', category: '', weight: 0.8 });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  // Cargar preguntas desde Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const qSnap = await getDocs(collection(db, 'questions'));
      const qList = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(qList);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Agregar o editar pregunta
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.text.trim() || !form.category) {
      setError('Completa todos los campos');
      return;
    }
    try {
      if (editId) {
        await updateDoc(doc(db, 'questions', editId), {
          text: form.text,
          category: form.category,
          weight: parseFloat(form.weight)
        });
      } else {
        await addDoc(collection(db, 'questions'), {
          text: form.text,
          category: form.category,
          weight: parseFloat(form.weight)
        });
      }
      setForm({ text: '', category: '', weight: 0.8 });
      setEditId(null);
      // Recargar preguntas
      const qSnap = await getDocs(collection(db, 'questions'));
      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    }
  };

  // Editar pregunta
  const handleEdit = q => {
    setForm({ text: q.text, category: q.category, weight: q.weight });
    setEditId(q.id);
  };

  // Eliminar pregunta
  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    await deleteDoc(doc(db, 'questions', id));
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Gestión de Preguntas</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-4 items-end">
        <input
          name="text"
          value={form.text}
          onChange={handleChange}
          placeholder="Texto de la pregunta"
          className="border p-2 rounded w-full md:w-1/2"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Categoría</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input
          name="weight"
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={form.weight}
          onChange={handleChange}
          className="border p-2 rounded w-24"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Actualizar' : 'Agregar'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? <p>Cargando preguntas...</p> : (
        <table className="w-full text-left border-t">
          <thead>
            <tr>
              <th className="py-2">Pregunta</th>
              <th>Categoría</th>
              <th>Peso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id} className="border-t">
                <td className="py-2">{q.text}</td>
                <td>{q.category}</td>
                <td>{q.weight}</td>
                <td>
                  <button onClick={() => handleEdit(q)} className="text-blue-600 mr-2">Editar</button>
                  <button onClick={() => handleDelete(q.id)} className="text-red-600">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 