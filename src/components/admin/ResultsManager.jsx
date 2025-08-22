// src/components/admin/ResultsManager.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Definir las categorías fuera del componente para evitar re-renderizados innecesarios
const CATEGORIES = ['EXPLORADOR', 'HACEDOR', 'COMUNICADOR', 'ORGANIZADOR', 'CREATIVO'];

export default function ResultsManager() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndCalculateStats = async () => {
            try {
                setLoading(true);
                const resultsCollectionRef = collection(db, 'results');
                const querySnapshot = await getDocs(resultsCollectionRef);

                const rawResults = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Firebase Firestore timestamp object
                    const completedAt = data.date && data.date.seconds ? new Date(data.date.seconds * 1000) : null;
                    
                    // CORRECCIÓN: Acceder directamente al array de answers
                    // En base a la estructura de datos proporcionada
                    const answers = data.answers || [];
                    
                    return {
                        userId: data.userId,
                        answers,
                        completedAt
                    };
                });

                // 1. Filtrar para obtener solo el test más reciente de cada usuario
                const latestResults = {};
                rawResults.forEach(result => {
                    if (result.userId && (!latestResults[result.userId] || 
                        (result.completedAt && result.completedAt > latestResults[result.userId].completedAt))) {
                        latestResults[result.userId] = result;
                    }
                });

                const filteredResults = Object.values(latestResults);
                const totalStudents = filteredResults.length;

                // 2. Calcular los puntajes normalizados para cada categoría a nivel global
                const globalCategoryScores = {};
                const globalCategoryCounts = {};
                
                CATEGORIES.forEach(cat => {
                    globalCategoryScores[cat] = 0;
                    globalCategoryCounts[cat] = 0;
                });

                filteredResults.forEach(result => {
                    result.answers.forEach(a => {
                        if (CATEGORIES.includes(a.category)) {
                            globalCategoryCounts[a.category]++;
                            if (a.value) {
                                globalCategoryScores[a.category] += a.weight;
                            }
                        }
                    });
                });

                // 3. Normalizar los puntajes para la visualización
                const normalizedScores = {};
                CATEGORIES.forEach(cat => {
                    normalizedScores[cat] = globalCategoryCounts[cat] > 0 ? 
                        (globalCategoryScores[cat] / globalCategoryCounts[cat]) : 0;
                });

                // 4. Transformar a array para Recharts
                const chartData = Object.entries(normalizedScores).map(([category, score]) => ({
                    category,
                    score: Math.round(score * 100)
                }));
                
                // Ordenar los datos para la gráfica de mayor a menor afinidad
                chartData.sort((a, b) => b.score - a.score);

                setStats({ totalStudents, chartData });
                setError(null);

            } catch (err) {
                console.error("Error al cargar y calcular las estadísticas: ", err);
                setError("No se pudieron cargar las estadísticas. Verifica tu conexión y permisos.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndCalculateStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-600">Calculando estadísticas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
                <p>{error}</p>
            </div>
        );
    }
    
    if (!stats || stats.totalStudents === 0) {
        return (
            <div className="text-center p-4 bg-yellow-100 text-yellow-700 rounded-md">
                <p>Aún no hay resultados de tests completados para generar estadísticas.</p>
            </div>
        );
    }

    // Colores para la gráfica
    const barFillColor = '#3B82F6';
    const axisTextColor = '#4B5563';

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Estadísticas del Test</h2>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-gray-800">
                <p className="text-xl font-bold mb-2">Total de Estudiantes que Completaron el Test:</p>
                <p className="text-4xl font-extrabold text-blue-600">{stats.totalStudents}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Perfil Vocacional Promedio de Todos los Usuarios</h3>
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.chartData}
                            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="category" 
                                angle={-30} 
                                textAnchor="end" 
                                height={50}
                                tick={{ fill: axisTextColor, fontSize: 12 }}
                            />
                            <YAxis 
                                tick={{ fill: axisTextColor, fontSize: 12 }}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip formatter={(value) => [`${value}% de afinidad`, 'Puntuación Promedio']} />
                            <Bar dataKey="score" fill={barFillColor} radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}