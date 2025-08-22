// src/components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import QuestionsManager from './QuestionsManager';
import StudentsManager from './StudentsManager';
import ResultsManager from './ResultsManager'; // Importa el nuevo componente

export default function AdminDashboard() {
  const [section, setSection] = useState('estadisticas');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Panel de Administración</h1>
        <nav className="mb-8">
          <ul className="flex gap-6 text-lg text-blue-700">
            <li>
              <button className={section === 'estadisticas' ? 'font-semibold' : 'text-gray-400'} onClick={() => setSection('estadisticas')}>Estadísticas</button>
            </li>
            <li>
              <button className={section === 'estudiantes' ? 'font-semibold' : 'text-gray-400'} onClick={() => setSection('estudiantes')}>Estudiantes</button>
            </li>
            <li>
              <button className={section === 'resultados' ? 'font-semibold' : 'text-gray-400'} onClick={() => setSection('resultados')}>Resultados</button> {/* ✅ Agrega el nuevo botón aquí */}
            </li>
            <li>
              <button className={section === 'preguntas' ? 'font-semibold' : 'text-gray-400'} onClick={() => setSection('preguntas')}>Preguntas</button>
            </li>
            <li>
              <button className={section === 'configuracion' ? 'font-semibold' : 'text-gray-400'} onClick={() => setSection('configuracion')}>Configuración</button>
            </li>
          </ul>
        </nav>
        <div>
          {section === 'estadisticas' && <p className="text-gray-700">Bienvenido al panel de administración. Aquí podrás ver estadísticas, gestionar estudiantes, preguntas y la configuración del test vocacional.</p>}
          {section === 'estudiantes' && <StudentsManager />}
          {section === 'resultados' && <ResultsManager />} {/* ✅ Agrega la nueva sección aquí */}
          {section === 'preguntas' && <QuestionsManager />}
          {/* Secciones futuras: configuración */}
        </div>
      </div>
    </div>
  );
}