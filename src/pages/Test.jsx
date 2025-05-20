// src/pages/Test.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../services/questions";
import { getNextQuestion } from "../services/algorithm";
import { db, auth } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

export default function Test() {
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = async (value) => {
    if (!currentQuestion) return;

    // 1) Añadimos la respuesta al array
    const answerObj = {
      id: currentQuestion.id,
      value,
      category: currentQuestion.category,
      weight: currentQuestion.weight,
    };
    const newAnswers = [...answers, answerObj];
    setAnswers(newAnswers);

    // 2) Calculamos la siguiente pregunta
    const next = getNextQuestion(newAnswers);
    if (next) {
      setCurrentQuestion(next);
      return;
    }

    // 3) Si no hay más preguntas, guardamos en Firestore
    setSaving(true);
    setError(null);

    console.log("🔐 Usuario:", auth.currentUser?.uid);
    console.log("📨 Datos a guardar:", newAnswers);

    try {
      await addDoc(collection(db, "results"), {
        userId: auth.currentUser.uid,
        date: Timestamp.now(),
        answers: newAnswers,
      });
      console.log("✅ Guardado exitoso");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error guardando en Firestore:", err);
      setError(err.message);
      setSaving(false);
    }
  };

  // Mientras se guarda, mostramos un feedback
  if (saving) {
    return (
      <div style={{ padding: 20 }}>
        <p>Guardando resultados…</p>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{currentQuestion.text}</h2>
      <button
        style={{ marginRight: 10 }}
        onClick={() => handleAnswer(true)}
      >
        Sí
      </button>
      <button onClick={() => handleAnswer(false)}>No</button>
      <p>
        Pregunta {answers.length + 1} de {questions.length}
      </p>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
