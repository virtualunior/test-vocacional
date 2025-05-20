// src/services/algorithm.js
// Algoritmo adaptativo de test vocacional sin TensorFlow

import { questions } from './questions';

// Parámetros del test
export const MAX_ITEMS = 30;    // Número total de preguntas en el test
const EXTRA_POOL = 20;           // Preguntas extra para consolidación
const CATEGORIES = [...new Set(questions.map(q => q.category))];
const EXPLORATION_COUNT = CATEGORIES.length * 2;  // fase exploración: 2 preguntas por categoría

/**
 * Devuelve la siguiente pregunta basada en un algoritmo adaptativo:
 * 1) Exploración inicial: 2 preguntas por categoría (randomizadas en orden de categorías)
 * 2) Consolidación adaptativa: selecciona preguntas de la categoría con mayor puntaje acumulado
 * 3) Fallback aleatorio si no quedan preguntas de esa categoría
 */
export function getNextQuestion(currentAnswers) {
  const askedIds = new Set(currentAnswers.map(a => a.id));
  const askedCount = currentAnswers.length;
  const remaining = questions.filter(q => !askedIds.has(q.id));

  // Fin del test
  if (askedCount >= MAX_ITEMS || remaining.length === 0) {
    return null;
  }

  // Fase 1: Exploración inicial
  if (askedCount < EXPLORATION_COUNT) {
    // Determina categoría cíclica
    const categoryIndex = askedCount % CATEGORIES.length;
    const cat = CATEGORIES[categoryIndex];
    const candidates = remaining.filter(q => q.category === cat);
    if (candidates.length > 0) {
      // Elegir aleatoriamente dentro de la categoría
      const idx = Math.floor(Math.random() * candidates.length);
      return candidates[idx];
    }
    // Si no hay más en esa categoría, caer a siguiente fase
  }

  // Fase 2: Consolidación adaptativa
  // Calcula puntaje por categoría: suma de weights para respuestas "Sí"
  const scores = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {});
  for (const ans of currentAnswers) {
    if (ans.value) {
      scores[ans.category] += ans.weight;
    }
  }
  // Ordena categorías de mayor a menor puntaje
  const sortedCats = CATEGORIES.slice().sort((a, b) => scores[b] - scores[a]);
  for (const cat of sortedCats) {
    const candidates = remaining.filter(q => q.category === cat);
    if (candidates.length > 0) {
      // Elegir la pregunta con mayor weight dentro de la categoría
      candidates.sort((a, b) => b.weight - a.weight);
      return candidates[0];
    }
  }

  // Fase 3: Fallback global (aleatorio)
  const idx = Math.floor(Math.random() * remaining.length);
  return remaining[idx];
}
