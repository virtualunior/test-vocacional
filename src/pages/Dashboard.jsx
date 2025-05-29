import { useEffect, useState } from "react"
import { db, auth } from "../firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import Results from "../components/Results"
import Layout from "../components/Layout" // Import the new Layout component
import { useNavigate } from "react-router-dom"
import { FaPlus, FaClipboardList, FaChartLine, FaCalendarAlt, FaClock } from "react-icons/fa"

export default function Dashboard() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Only fetch if a user is logged in
    if (!auth.currentUser) {
      setLoading(false) // If no user, stop loading immediately
      // Optionally redirect to login if not authenticated
      navigate("/login")
      return
    }

    const fetchAllTests = async () => {
      try {
        const q = query(collection(db, "results"), where("userId", "==", auth.currentUser.uid), orderBy("date", "desc"))
        const snap = await getDocs(q)
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          date: doc.data().date.toDate(),
          answers: doc.data().answers,
        }))
        setTests(items)
        // Automatically select the most recent test if available
        if (items.length > 0) {
          setSelected(items[0])
        }
      } catch (err) {
        console.error("Error al leer los tests:", err)
        setError("No se pudieron cargar tus tests. Por favor, inténtalo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchAllTests()
  }, [auth.currentUser, navigate]) // Add navigate to dependency array

  const handleStartNewTest = () => {
    navigate("/test") // Navigate to the /test route
  }

  // --- Loading, Error, and Empty States ---
  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#db1f26] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Cargando tus tests...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  // --- Main Dashboard Layout ---
  return (
    <Layout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-lg text-gray-600 mb-4">
              Bienvenido a tu panel de orientación vocacional. Aquí puedes realizar nuevos tests y revisar tus
              resultados anteriores.
            </p>
          </div>
          <button
            onClick={handleStartNewTest}
            className="flex items-center gap-2 bg-gradient-to-r from-[#db1f26] to-[#660915] hover:from-[#c01e24] hover:to-[#5a0812] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#db1f26] focus:ring-opacity-50"
          >
            <FaPlus className="text-lg" />
            Realizar Nuevo Test
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-white text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{tests.length}</p>
              <p className="text-sm text-blue-700">Tests Realizados</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{selected ? "Disponible" : "Pendiente"}</p>
              <p className="text-sm text-green-700">Último Resultado</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {tests.length > 0 ? tests[0].date.toLocaleDateString() : "N/A"}
              </p>
              <p className="text-sm text-purple-700">Último Test</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tests List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <FaClipboardList className="text-[#db1f26]" />
              Tests Realizados
            </h2>
            {tests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaClipboardList className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 mb-4">Aún no has completado ningún test.</p>
                <button
                  onClick={handleStartNewTest}
                  className="text-[#db1f26] hover:text-[#660915] font-medium text-sm"
                >
                  Realizar tu primer test →
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tests.map((testItem) => (
                  <button
                    key={testItem.id}
                    onClick={() => setSelected(testItem)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      selected && selected.id === testItem.id
                        ? "bg-[#db1f26] text-white border-[#db1f26] shadow-md"
                        : "bg-white border-gray-200 hover:border-[#db1f26] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selected && selected.id === testItem.id ? "bg-white/20" : "bg-[#db1f26]/10"
                        }`}
                      >
                        <FaCalendarAlt
                          className={selected && selected.id === testItem.id ? "text-white" : "text-[#db1f26]"}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Test de {testItem.date.toLocaleDateString()}</p>
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <FaClock />
                          {testItem.date.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 min-h-[500px]">
            {selected ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#db1f26] rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Resultados del Test</h2>
                    <p className="text-sm text-gray-600">
                      {selected.date.toLocaleDateString()} a las {selected.date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Results answers={selected.answers} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaChartLine className="text-gray-400 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un test para ver los resultados</h3>
                  <p className="text-gray-500 mb-4">Elige un test de la lista para visualizar tu perfil vocacional.</p>
                  {tests.length === 0 && (
                    <button
                      onClick={handleStartNewTest}
                      className="bg-[#db1f26] hover:bg-[#660915] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Realizar Primer Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}


