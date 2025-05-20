// src/components/Results.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Results({ answers }) {
  // Calcula puntajes por categoría: suma weights de respuestas “sí”
  const scores = answers.reduce((acc, ans) => {
    if (ans.value) {
      acc[ans.category] = (acc[ans.category] || 0) + ans.weight;
    }
    return acc;
  }, {});

  // Transforma a array para Recharts
  const data = Object.entries(scores).map(([category, score]) => ({
    category,
    score: Math.round(score * 100) / 100 // redondeo opcional
  }));

  if (data.length === 0) {
    return <p>No hay respuestas positivas para graficar.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
