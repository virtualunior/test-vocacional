import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';

// 💡 Importar ambas partes de la librería explícitamente
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const STUDENTS_PER_PAGE = 10;

export default function StudentsManager() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [history, setHistory] = useState([null]);

    const calculateAge = (birthYear) => {
        if (!birthYear) return 'N/A';
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    };

    const fetchStudents = async (next = true) => {
        try {
            setLoading(true);
            setError(null);

            let q;
            const startDoc = next ? history[page - 1] : history[page - 2];
            q = query(collection(db, 'users'), orderBy('name'), startAfter(startDoc || ''), limit(STUDENTS_PER_PAGE));

            const documentSnapshots = await getDocs(q);

            if (documentSnapshots.docs.length > 0) {
                const studentsList = documentSnapshots.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'N/A',
                        email: data.email || 'N/A',
                        phone: data.phone || 'N/A',
                        age: calculateAge(data.birthYear),
                    };
                });
                
                setStudents(studentsList);
                setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
                setHasMore(documentSnapshots.docs.length === STUDENTS_PER_PAGE);

                if (next && documentSnapshots.docs.length === STUDENTS_PER_PAGE && history[page] !== documentSnapshots.docs[documentSnapshots.docs.length - 1]) {
                    setHistory(prevHistory => [...prevHistory, documentSnapshots.docs[documentSnapshots.docs.length - 1]]);
                }
            } else {
                setStudents([]);
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error al cargar los estudiantes: ", err);
            setError("No se pudieron cargar los datos de los estudiantes. Verifica tu conexión y los permisos de Firebase.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
        fetchStudents(true);
    };

    const handlePreviousPage = () => {
        setPage(prevPage => prevPage - 1);
        setHistory(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
        fetchStudents(false);
    };

    const fetchAllStudents = async () => {
        const allStudentsQuery = query(collection(db, 'users'), orderBy('name'));
        const querySnapshot = await getDocs(allStudentsQuery);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                age: calculateAge(data.birthYear),
            };
        });
    };

    const handleExportCSV = async () => {
        setLoading(true);
        try {
            const studentsList = await fetchAllStudents();

            if (studentsList.length > 0) {
                const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Edad'];
                const rows = studentsList.map(s => [
                    `"${s.id.replace(/"/g, '""')}"`,
                    `"${s.name.replace(/"/g, '""')}"`,
                    `"${s.email.replace(/"/g, '""')}"`,
                    `"${s.phone.replace(/"/g, '""')}"`,
                    `"${s.age}"`
                ].join(','));
                
                const bom = "\uFEFF";
                const csvContent = `${bom}${headers.join(',')}\n${rows.join('\n')}`;
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "estudiantes.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('No hay registros para exportar.');
            }
        } catch (err) {
            console.error("Error al exportar los datos: ", err);
            alert('Hubo un error al exportar los datos. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const studentsList = await fetchAllStudents();

            if (studentsList.length > 0) {
                const doc = new jsPDF();
                
                doc.text("Reporte de Estudiantes", 14, 20);

                const tableData = studentsList.map(s => [s.id, s.name, s.email, s.phone, s.age]);
                const tableHeaders = [['ID', 'Nombre', 'Email', 'Teléfono', 'Edad']];

                doc.autoTable({
                    head: tableHeaders,
                    body: tableData,
                    startY: 30,
                    styles: {
                        font: 'helvetica',
                        fontSize: 10,
                        cellPadding: 3,
                        halign: 'left',
                        valign: 'middle'
                    },
                    headStyles: {
                        fillColor: [59, 130, 246],
                        textColor: [255, 255, 255]
                    },
                    margin: { top: 20 }
                });

                doc.save('estudiantes.pdf');
            } else {
                alert('No hay registros para exportar.');
            }
        } catch (err) {
            console.error("Error al exportar a PDF: ", err);
            alert('Hubo un error al exportar los datos a PDF. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && students.length === 0) {
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

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lista de Estudiantes</h2>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
                <p className="text-sm text-gray-600">Página {page}</p>
                <div className="flex space-x-2">
                    <button
                        onClick={handleExportPDF}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                        disabled={loading}
                    >
                        Exportar a PDF
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                        disabled={loading}
                    >
                        Exportar a CSV
                    </button>
                </div>
            </div>

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
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">No se encontraron estudiantes registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1 || loading}
                    className={`bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded transition duration-200 ${page === 1 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                    Anterior
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={!hasMore || loading}
                    className={`bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-200 ${!hasMore || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}