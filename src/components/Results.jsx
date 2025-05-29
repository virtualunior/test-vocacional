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
import { careerProfiles } from '../services/careerProfiles'; // Importa los perfiles de carrera

export default function Results({ answers }) {
    // Definir las categorías principales tal como están en questions.js y algorithm.js
    const CATEGORIES = ['EXPLORADOR', 'HACEDOR', 'COMUNICADOR', 'ORGANIZADOR', 'CREATIVO'];

    // 1. Calcula puntajes normalizados por categoría
    // Esto es crucial para comparar categorías de manera justa
    const categoryScores = {};
    const categoryCounts = {};

    CATEGORIES.forEach(cat => {
        categoryScores[cat] = 0;
        categoryCounts[cat] = 0;
    });

    answers.forEach(a => {
        // Asegúrate de que la categoría exista antes de sumar
        if (CATEGORIES.includes(a.category)) {
            categoryCounts[a.category]++;
            if (a.value) { // Solo si la respuesta es 'sí' (o true)
                categoryScores[a.category] += a.weight;
            }
        }
    });

    const normalizedScores = {};
    CATEGORIES.forEach(cat => {
        // Normaliza dividiendo por el número de preguntas respondidas en esa categoría,
        // o por el peso máximo posible si quieres una escala más absoluta.
        // Aquí usaremos el promedio del peso por pregunta respondida positivamente.
        // O podrías normalizar por la suma de todos los pesos de las preguntas en esa categoría
        // si conoces el total de preguntas por categoría en tu banco de preguntas.
        // Para este ejemplo, usaremos el promedio de los pesos de las respuestas positivas.
        normalizedScores[cat] = categoryCounts[cat] > 0 ? categoryScores[cat] / categoryCounts[cat] : 0;
        // Si quieres una normalización sobre el total de preguntas (MAX_QUESTIONS)
        // podrías adaptar esto.
        // Ejemplo simplificado: si sabes que hay 15 preguntas por categoría y el max weight es 1
        // normalizedScores[cat] = categoryScores[cat] / (15 * 1); // o 0.9 si ese es el max weight
    });

    // Transforma a array para Recharts (usando los scores normalizados para la gráfica)
    const chartData = Object.entries(normalizedScores).map(([category, score]) => ({
        category,
        score: Math.round(score * 100) // Multiplica por 100 para un porcentaje o escala de 0-100
    }));

    // Si no hay datos, muestra un mensaje
    if (chartData.length === 0 || chartData.every(item => item.score === 0)) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p className="text-xl font-semibold">¡Aún no hay resultados para mostrar!</p>
                <p className="text-base mt-2">Responde el test para descubrir tus afinidades vocacionales.</p>
            </div>
        );
    }

    // Ordenar los datos para la gráfica de mayor a menor afinidad
    chartData.sort((a, b) => b.score - a.score);


    // 2. Lógica para Sugerir Carreras
    const suggestedCareers = [];
    const careerAffinities = {}; // Para guardar la afinidad calculada para cada carrera

    Object.keys(careerProfiles).forEach(careerName => {
        const profile = careerProfiles[careerName];
        let affinityScore = 0;
        let totalIdealWeight = 0;

        // Calcular la afinidad de la carrera con el perfil del estudiante
        CATEGORIES.forEach(cat => {
            const studentScore = normalizedScores[cat]; // Puntaje normalizado del estudiante para la categoría
            const idealWeight = profile.idealProfile[cat] || 0; // Peso ideal de la categoría para la carrera

            affinityScore += studentScore * idealWeight; // Multiplica la afinidad del estudiante por la importancia de la categoría para la carrera
            totalIdealWeight += idealWeight;
        });

        // Normalizar la afinidad total de la carrera
        // Esto evita que carreras con más categorías importantes tengan una ventaja injusta
        careerAffinities[careerName] = totalIdealWeight > 0 ? affinityScore / totalIdealWeight : 0;
    });

    // Ordenar las carreras por el puntaje de afinidad de mayor a menor
    const sortedCareers = Object.entries(careerAffinities)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .filter(([, score]) => score > 0.3); // Filtrar solo las carreras con afinidad significativa

    // Seleccionar las top 3 o 4 carreras sugeridas
    sortedCareers.slice(0, 3).forEach(([careerName, score]) => {
        if (score > 0) { // Solo añadir si hay alguna afinidad
            suggestedCareers.push({
                name: careerName,
                score: Math.round(score * 100), // Convertir a porcentaje
                profile: careerProfiles[careerName]
            });
        }
    });

    // Define tus colores para Recharts
    const primaryColor = '#db1f26'; // Tu rojo/granate principal
    const secondaryColor = '#f4c80d'; // Tu amarillo secundario
    const axisTextColor = '#CBD5E0'; // Tailwind's gray-300 para el texto de los ejes
    const gridLineColor = '#4A5568'; // Tailwind's gray-800 para las líneas de la cuadrícula
    const barFillColor = '#3B82F6'; // Un azul vibrante para las barras
    const highlightColor = '#22D3EE'; // Un color de contraste para resaltar la barra más alta

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-gray-900 rounded-xl shadow-lg text-white">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-yellow-400">¡Tu Perfil Vocacional Revelado!</h2>
            <p className="text-center text-lg mb-8 text-gray-300">
                Basado en tus respuestas, este es un resumen de tus afinidades e intereses.
            </p>

            {/* Sección de Gráfico */}
            <div className="bg-white bg-opacity-5 p-4 rounded-lg mb-8 shadow-inner">
                <h3 className="text-xl md:text-2xl font-semibold text-center mb-4 text-white">Tus Fortalezas por Área</h3>
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} opacity={0.6} />
                            <XAxis
                                dataKey="category"
                                angle={-30}
                                textAnchor="end"
                                tick={{ fill: axisTextColor, fontSize: 12 }}
                                height={50}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: axisTextColor, fontSize: 12 }}
                                domain={[0, 100]} // Escala de 0 a 100 para porcentajes
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#1F2937',
                                    padding: '10px'
                                }}
                                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                                itemStyle={{ color: '#1F2937' }}
                                formatter={(value) => [`${value}% de afinidad`, 'Puntuación']}
                            />
                            <Bar
                                dataKey="score"
                                fill={barFillColor} // Color principal de las barras
                                radius={[5, 5, 0, 0]}
                                // Puedes usar un color diferente para la barra más alta si quieres
                                // fill={(data) => data.category === chartData[0]?.category ? highlightColor : barFillColor}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sección de Sugerencias de Carrera */}
            <div className="bg-white bg-opacity-5 p-4 rounded-lg shadow-inner">
                <h3 className="text-xl md:text-2xl font-semibold text-center mb-4 text-yellow-400">Carreras Sugeridas para Ti</h3>
                {suggestedCareers.length === 0 ? (
                    <p className="text-center text-gray-300">
                        No hemos encontrado afinidades claras con las carreras disponibles. ¡Sigue explorando tus intereses!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {suggestedCareers.map((career, index) => (
                            <div key={index} className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700">
                                <h4 className="text-xl font-bold text-blue-300 mb-2">{career.name}</h4>
                                <p className="text-sm text-gray-400 mb-3">
                                    Afinidad: <span className="font-semibold text-blue-200">{career.score}%</span>
                                </p>
                                <p className="text-gray-300 text-sm mb-3">
                                    {career.profile.description}
                                </p>
                                <p className="text-xs text-gray-500 italic mb-2">
                                    Palabras clave: {career.profile.keywords.join(', ')}.
                                </p>
                                <div className="mt-auto"> {/* Ensures motivations are at bottom */}
                                    {career.profile.motivations.map((m, i) => (
                                        <p key={i} className="text-sm text-green-300 mb-1">
                                            🌟 {m}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 <p className="text-center text-gray-400 text-sm mt-6">
                    Recuerda que este test es una guía. ¡Tu pasión y esfuerzo son la clave de tu éxito! Explora más a fondo las carreras que te interesen.
                </p>
            </div>
        </div>
    );
}
