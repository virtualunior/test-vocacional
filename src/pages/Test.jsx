// src/pages/Test.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getNextQuestion, MAX_QUESTIONS } from "../services/algorithm"
import { db, auth } from "../firebase"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { FaCheckCircle, FaTimesCircle, FaSave, FaExclamationCircle, FaBrain, FaLightbulb } from "react-icons/fa"
import Layout from "../components/Layout" // Import the new Layout component

export default function Test() {
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(() => getNextQuestion([]))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleAnswer = async (value) => {
    // Prevent multiple answers or answering if no question
    if (!currentQuestion || saving) return

    // Add a small delay for visual feedback of button press
    const answerDelay = 200 // ms

    // 1) Guardar respuesta
    const answerObj = {
      id: currentQuestion.id,
      value,
      category: currentQuestion.category,
      weight: currentQuestion.weight,
    }
    const newAnswers = [...answers, answerObj]
    setAnswers(newAnswers)

    // 2) Obtener siguiente pregunta
    const next = getNextQuestion(newAnswers)

    if (next) {
      // Simulate transition for next question
      setTimeout(() => {
        setCurrentQuestion(next)
      }, answerDelay)
    } else {
      // 3) Finalizar test: guardar en Firestore y redirigir
      setSaving(true)
      setError(null)
      try {
        await addDoc(collection(db, "results"), {
          userId: auth.currentUser.uid,
          date: Timestamp.now(),
          answers: newAnswers,
        })
        setTimeout(() => {
          navigate("/dashboard")
        }, answerDelay + 300) // Give a bit more time for saving message
      } catch (err) {
        setError("Error al guardar tus resultados: " + err.message)
        setSaving(false)
      }
    }
  }

  // --- Loading/Saving State ---
  if (saving) {
    return (
      <Layout title="Guardando Resultados">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 md:p-12 shadow-lg border border-blue-200 max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSave className="text-3xl text-white animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Procesando tus respuestas</h2>
            <p className="text-lg text-gray-700 mb-6">Guardando tus resultados...</p>
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-700 flex items-center justify-center gap-2">
                  <FaExclamationCircle /> {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  // --- No Questions State ---
  if (!currentQuestion && !saving) {
    return (
      <Layout title="Test Completado">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 md:p-12 shadow-lg border border-green-200 max-w-2xl mx-auto">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-4xl text-white" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-200 rounded-full animate-pulse opacity-30"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">¡Test Completado!</h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Gracias por completar el test. Tus respuestas han sido procesadas exitosamente.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-[#db1f26] to-[#660915] hover:from-[#c01e24] hover:to-[#5a0812] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Ver Mis Resultados
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // Calculate progress percentage
  const progressPercentage = (answers.length / MAX_QUESTIONS) * 100

  // --- Main Test View ---
  return (
    <Layout title="Test de Orientación Vocacional">
      {/* Progress Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FaBrain className="text-[#db1f26] text-xl" />
            <span className="text-sm md:text-base font-medium text-gray-700">Progreso del Test</span>
          </div>
          <span className="text-sm md:text-base font-bold text-gray-900">
            {answers.length} / {MAX_QUESTIONS}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#db1f26] to-[#660915] h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{Math.round(progressPercentage)}% completado</p>
      </div>

      {/* Main Question Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#db1f26] to-[#660915] p-6 md:p-8 text-white">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl md:text-3xl font-bold">{answers.length + 1}</span>
            </div>
            <div className="text-center">
              <p className="text-lg md:text-xl font-semibold">Pregunta</p>
              <p className="text-sm md:text-base opacity-90">de {MAX_QUESTIONS}</p>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8 md:p-12 text-center">
          {/* Decorative Icons */}
          <div className="flex justify-center gap-8 mb-8 opacity-20">
            <FaBrain className="text-3xl md:text-4xl text-[#db1f26] animate-pulse" />
            <FaLightbulb
              className="text-3xl md:text-4xl text-yellow-500 animate-bounce"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 leading-relaxed text-gray-900">
            {currentQuestion.text}
          </h2>

          {/* Answer Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center max-w-2xl mx-auto">
            <button
              onClick={() => handleAnswer(true)}
              className="group relative flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300/50 w-full sm:w-auto min-w-[160px] md:min-w-[200px] text-white"
            >
              <FaCheckCircle className="text-2xl md:text-3xl group-hover:rotate-12 transition-transform duration-300" />
              <span>Sí</span>
            </button>

            <button
              onClick={() => handleAnswer(false)}
              className="group relative flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300/50 w-full sm:w-auto min-w-[160px] md:min-w-[200px] text-white"
            >
              <FaTimesCircle className="text-2xl md:text-3xl group-hover:rotate-12 transition-transform duration-300" />
              <span>No</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 flex items-center justify-center gap-2 font-medium">
                <FaExclamationCircle className="text-xl" /> {error}
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Responde con sinceridad. No hay respuestas correctas o incorrectas.</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <FaBrain className="text-blue-500 text-2xl mx-auto mb-2" />
          <p className="text-sm font-medium text-blue-900">Test Científico</p>
          <p className="text-xs text-blue-700">Basado en metodología validada</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
          <p className="text-sm font-medium text-green-900">Resultados Precisos</p>
          <p className="text-xs text-green-700">Análisis detallado de tu perfil</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <FaLightbulb className="text-purple-500 text-2xl mx-auto mb-2" />
          <p className="text-sm font-medium text-purple-900">Orientación Personalizada</p>
          <p className="text-xs text-purple-700">Recomendaciones específicas</p>
        </div>
      </div>
    </Layout>
  )
}
