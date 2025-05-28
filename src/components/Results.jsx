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
    return (
      <div className="text-center py-4 text-gray-400">
        <p>No hay respuestas positivas para graficar.</p>
        <p className="text-sm mt-1">Completa el test para ver tus resultados aquí.</p>
      </div>
    );
  }

  // Define your theme colors for Recharts
  // Using primary (red) and secondary (yellow) from your app
  const primaryColor = '#db1f26'; // Your primary red/maroon
  const secondaryColor = '#f4c80d'; // Your secondary yellow
  const axisTextColor = '#9CA3AF'; // Tailwind's gray-400 for axes text
  const gridLineColor = '#4B5563'; // Tailwind's gray-700 for grid lines

  return (
    <div className="w-full h-80 sm:h-96 p-2 rounded-lg bg-white bg-opacity-5"> {/* Added styling to container */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 10, // Reduced right margin to maximize space
            left: -10, // Adjusted left margin for XAxis labels to not be cut off
            bottom: 5,
          }}
        >
          {/* Grid lines - Changed to a subtle gray */}
          <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} opacity={0.6} />

          {/* XAxis (Categories) - Styled text for readability */}
          <XAxis
            dataKey="category"
            angle={-30} // Angle labels to prevent overlap if many categories
            textAnchor="end" // Anchor text at the end of the angled line
            tick={{ fill: axisTextColor, fontSize: 12 }} // Text color and size
            height={50} // Give more height for angled labels
            interval={0} // Show all labels
          />

          {/* YAxis (Scores) - Styled text for readability */}
          <YAxis
            tick={{ fill: axisTextColor, fontSize: 12 }} // Text color and size
            domain={[0, 'auto']} // Start from 0, auto max
          />

          {/* Tooltip - Provides detailed info on hover */}
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} // Light, semi-transparent background for cursor
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)', // Near opaque white background
              border: 'none',
              borderRadius: '8px',
              color: '#1F2937' // Dark text for tooltip content
            }}
            labelStyle={{ color: '#1F2937' }} // Dark text for label
            itemStyle={{ color: '#1F2937' }} // Dark text for individual items
          />

          {/* Bars - Using your secondary color, with a subtle darker hover */}
          <Bar
            dataKey="score"
            fill={secondaryColor} // Your secondary university color
            radius={[5, 5, 0, 0]} // Rounded tops of bars
            // Add a custom animation or hover effect if desired (more complex)
            // Example: onMouseOver={(data) => console.log(data)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
