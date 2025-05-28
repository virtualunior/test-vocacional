// src/pages/Test.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNextQuestion, MAX_QUESTIONS } from "../services/algorithm";
import { db, auth } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaSave, FaExclamationCircle } from 'react-icons/fa'; // Import icons for better UX

export default function Test() {
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(() => getNextQuestion([]));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = async (value) => {
    // Prevent multiple answers or answering if no question
    if (!currentQuestion || saving) return;

    // Add a small delay for visual feedback of button press
    const answerDelay = 200; // ms

    // 1) Guardar respuesta
    const answerObj = {
      id: currentQuestion.id,
      value,
      category: currentQuestion.category,
      weight: currentQuestion.weight,
    };
    const newAnswers = [...answers, answerObj];
    setAnswers(newAnswers);

    // 2) Obtener siguiente pregunta
    const next = getNextQuestion(newAnswers);

    if (next) {
      // Simulate transition for next question
      setTimeout(() => {
        setCurrentQuestion(next);
      }, answerDelay);
    } else {
      // 3) Finalizar test: guardar en Firestore y redirigir
      setSaving(true);
      setError(null);
      try {
        await addDoc(collection(db, "results"), {
          userId: auth.currentUser.uid,
          date: Timestamp.now(),
          answers: newAnswers,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, answerDelay + 300); // Give a bit more time for saving message
      } catch (err) {
        setError("Error al guardar tus resultados: " + err.message);
        setSaving(false);
      }
    }
  };

  // --- Loading/Saving State ---
  if (saving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] text-white p-4">
        <FaSave className="text-6xl text-white animate-bounce mb-4" />
        <p className="text-xl font-semibold">Guardando tus resultados...</p>
        {error && (
          <p className="text-red-300 mt-4 flex items-center gap-2">
            <FaExclamationCircle /> {error}
          </p>
        )}
      </div>
    );
  }

  // --- No Questions State ---
  if (!currentQuestion && !saving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] text-white p-4 text-center">
        <h2 className="text-3xl font-bold mb-4">¡Test Completado!</h2>
        <p className="text-lg mb-6">Gracias por completar el test. Redirigiendo a tu dashboard...</p>
        {/* You could add a button to manually navigate in case auto-redirect fails */}
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-[#db1f26] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
        >
          Ir al Dashboard
        </button>
      </div>
    );
  }

  // --- Main Test View ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#db1f26] to-[#660915] text-white p-4 sm:p-6">
      <div className="bg-white bg-opacity-10 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md text-center backdrop-blur-sm">
        {/* Progress Indicator */}
        <p className="text-sm sm:text-base text-gray-800 mb-6">
          Pregunta <span className="font-bold text-red-800 text-lg">{answers.length + 1}</span> de <span className="font-bold text-red-800 text-lg">{MAX_QUESTIONS}</span>
        </p>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl text-gray-800 md:text-3xl font-bold mb-8 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Answer Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleAnswer(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"
          >
            <FaCheckCircle className="text-2xl" /> Sí
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-75"
          >
            <FaTimesCircle className="text-2xl" /> No
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-300 mt-6 flex items-center justify-center gap-2">
            <FaExclamationCircle /> {error}
          </p>
        )}
      </div>
    </div>
  );
}
