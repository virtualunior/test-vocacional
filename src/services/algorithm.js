// src/services/algorithm.js
// Algoritmo adaptativo de test vocacional sin TensorFlow

import { questions } from './questions';

// Configuración del test
export const MAX_QUESTIONS = 30;
const EXPLORATION_PHASE_LENGTH = 10;       // 2 preguntas por categoría (5×2)
const CATEGORIES = ['STEM', 'HUM', 'NAT', 'ART', 'SOC'];

// Cache para memoización de puntajes
let cache = { lastLen: -1, scores: {}, counts: {}, normalized: {} };

/**
 * Calcula puntajes por categoría y normaliza, memoizando resultados.
 */
function calculateScores(answers) {
  if (cache.lastLen === answers.length) {
    return cache;
  }
  const scores = {};
  const counts = {};
  CATEGORIES.forEach(cat => { scores[cat] = 0; counts[cat] = 0; });

  answers.forEach(a => {
    counts[a.category]++;
    if (a.value) scores[a.category] += a.weight;
  });

  const normalized = {};
  CATEGORIES.forEach(cat => {
    normalized[cat] = counts[cat] > 0 ? scores[cat] / counts[cat] : 0;
  });

  cache = { lastLen: answers.length, scores, counts, normalized };
  return cache;
}

/**
 * Determina la categoría dominante, con desempate por menor ocurrencia.
 */
//function getDominantCategory(scores, normalized, counts) {
  //const maxNorm = Math.max(...CATEGORIES.map(c => normalized[c]));
  //const top = CATEGORIES.filter(c => normalized[c] === maxNorm);
  //if (top.length === 1) return top[0];
  //top.sort((a, b) => counts[a] - counts[b]);
  //return top[0];
//}

function getDominantCategory(scores, normalized, counts) {
  const maxNorm = Math.max(...CATEGORIES.map(c => normalized[c]));
  const top = CATEGORIES.filter(c => normalized[c] === maxNorm);

  if (top.length === 1) return top[0];

  // Opción 1: Seleccionar aleatoriamente entre las categorías dominantes
  return top[Math.floor(Math.random() * top.length)];

  // Opción 2 (Si quieres priorizar la que YA ha tenido más preguntas, para solidificar su liderazgo):
  // top.sort((a, b) => counts[b] - counts[a]); // Orden descendente por counts
  // return top[0];
}

/**
 * Selecciona una pregunta de la lista por peso o aleatoriamente.
 */
function selectQuestion(candidates, mode) {
  if (mode === 'weighted') {
    let chosen = candidates[0];
    let best = -Infinity;
    candidates.forEach(q => {
      const w = q.weight * (0.9 + 0.2 * Math.random());
      if (w > best) { best = w; chosen = q; }
    });
    return chosen;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Devuelve la siguiente pregunta adaptativa.
 */
export function getNextQuestion(currentAnswers = []) {
  const askedIds = new Set(currentAnswers.map(a => a.id));
  const remaining = questions.filter(q => !askedIds.has(q.id));
  const n = currentAnswers.length;
  if (n >= MAX_QUESTIONS || remaining.length === 0) return null;

  // 1) Fase exploración (cíclica por categoría)
  if (n < EXPLORATION_PHASE_LENGTH) {
    const cat = CATEGORIES[n % CATEGORIES.length];
    const cand = remaining.filter(q => q.category === cat);
    if (cand.length) return selectQuestion(cand, 'random');
  }

  // 2) Fase adaptativa
  const { scores, counts, normalized } = calculateScores(currentAnswers);
  const dom = getDominantCategory(scores, normalized, counts);
  let cand = remaining.filter(q => q.category === dom);
  if (cand.length) return selectQuestion(cand, 'weighted');

  // 3) Fallback global
  return selectQuestion(remaining, 'random');
}