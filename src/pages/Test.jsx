// src/pages/Test.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNextQuestion, MAX_QUESTIONS } from "../services/algorithm";
import { db, auth } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

export default function Test() {
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(() => getNextQuestion([]));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = async (value) => {
    if (!currentQuestion) return;

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
      setCurrentQuestion(next);
      return;
    }

    // 3) Finalizar test: guardar en Firestore y redirigir
    setSaving(true);
    setError(null);
    try {
      await addDoc(collection(db, "results"), {
        userId: auth.currentUser.uid,
        date: Timestamp.now(),
        answers: newAnswers,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <div style={{ padding: 20 }}>
        <p>Guardando resultados…</p>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
    );
  }

  if (!currentQuestion) {
    return <p style={{ padding: 20 }}>No hay más preguntas.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{currentQuestion.text}</h2>
      <button style={{ marginRight: 10 }} onClick={() => handleAnswer(true)}>
        Sí
      </button>
      <button onClick={() => handleAnswer(false)}>No</button>
      <p>
        Pregunta {answers.length + 1} de {MAX_QUESTIONS}
      </p>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
