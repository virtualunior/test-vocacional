// src/services/algorithm.js
// Algoritmo adaptativo de test vocacional sin TensorFlow

import { questions } from './questions';
import { careerProfiles } from './careerProfiles';

// Configuración del test
export const MAX_QUESTIONS = 30;
const EXPLORATION_PHASE_LENGTH = 15;       // 3 preguntas por categoría (5×3)
export const CATEGORIES = ['EXPLORADOR', 'HACEDOR', 'COMUNICADOR', 'ORGANIZADOR', 'CREATIVO'];

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
 * Calcula la distancia euclidiana entre el perfil del usuario y el perfil ideal de cada carrera.
 * Retorna el top 3 de carreras más cercanas.
 */
export function matchCareersEuclidean(normalizedScores) {
  // normalizedScores: { EXPLORADOR: 0.7, HACEDOR: 0.2, ... }
  const results = Object.entries(careerProfiles).map(([career, data]) => {
    const ideal = data.idealProfile;
    // Distancia euclidiana
    const distance = Math.sqrt(
      Object.keys(ideal).reduce(
        (sum, cat) => sum + Math.pow((normalizedScores[cat] || 0) - ideal[cat], 2),
        0
      )
    );
    return { career, distance, profile: data };
  });
  // Ordenar por menor distancia
  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, 3); // Top 3 carreras
}

/**
 * Devuelve la siguiente pregunta adaptativa (mejorada: alterna entre las dos categorías más altas).
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

  // 2) Fase adaptativa mejorada: alternar entre las dos categorías más altas
  const { scores, counts, normalized } = calculateScores(currentAnswers);
  const sortedCats = Object.entries(normalized)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);
  const top2 = sortedCats.slice(0, 2);
  let cand = remaining.filter(q => top2.includes(q.category));
  if (cand.length) return selectQuestion(cand, 'weighted');

  // 3) Fallback global
  return selectQuestion(remaining, 'random');
}