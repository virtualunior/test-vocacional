// src/components/admin/StudentsManager.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Asegúrate de que esta ruta sea correcta
import { collection, getDocs } from 'firebase/firestore';

export default function StudentsManager() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para calcular la edad a partir del año de nacimiento
    const calculateAge = (birthYear) => {
        if (!birthYear) return 'N/A';
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true); // 💡 UX: Inicia el estado de carga
                const studentsCollectionRef = collection(db, 'users');
                const querySnapshot = await getDocs(studentsCollectionRef);
                
                const studentsList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'N/A',
                        email: data.email || 'N/A',
                        phone: data.phone || 'N/A',
                        age: calculateAge(data.birthYear), // Calcula la edad
                    };
                });
                
                setStudents(studentsList);
                setError(null); // Limpia cualquier error anterior
            } catch (err) {
                console.error("Error al cargar los estudiantes: ", err);
                // 💡 UX: Muestra un mensaje de error claro al usuario
                setError("No se pudieron cargar los datos de los estudiantes. Por favor, verifica tu conexión y los permisos de Firebase.");
            } finally {
                setLoading(false); // Finaliza el estado de carga
            }
        };

        fetchStudents();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-600">Cargando la lista de estudiantes...</p>
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
    
    if (students.length === 0) {
        return (
            <div className="text-center p-4 bg-yellow-100 text-yellow-700 rounded-md">
                <p>No se encontraron estudiantes registrados en la base de datos.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lista de Estudiantes</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}