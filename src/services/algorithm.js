// src/services/algorithm.js
import { questions } from "./questions";

// Lógica adaptativa básica:
// Si el usuario ha dicho “Sí” a STEM más de 2 veces, prioriza nuevas STEM.
// Si no, avanza por el orden definido en el array.

export function getNextQuestion(currentAnswers) {
  const stemYesCount = currentAnswers.filter(
    (a) => a.category === "STEM" && a.value === true
  ).length;

  // Intenta encontrar una pregunta STEM no contestada
  if (stemYesCount > 2) {
    const nextStem = questions.find(
      (q) =>
        q.category === "STEM" &&
        !currentAnswers.some((a) => a.id === q.id)
    );
    if (nextStem) return nextStem;
  }

  // Sino, devuelve la siguiente no contestada en orden
  return questions.find(
    (q) => !currentAnswers.some((a) => a.id === q.id)
  ) || null;
}
