import { getNextQuestion } from './algorithm';
import { questions } from './questions';

describe('Algoritmo para 5 Categorías', () => {
  test('Fase exploratoria cubre todas las categorías', () => {
    const answers = [];
    const selectedCategories = new Set();

    for (let i = 0; i < 10; i++) {
      const q = getNextQuestion(answers);
      selectedCategories.add(q.category);
      answers.push({ id: q.id, value: true, category: q.category });
    }

    expect(selectedCategories.size).toBe(5); // STEM, HUM, NAT, ART, SOC
  });

  test('Prioriza HUM si tiene alta puntuación', () => {
    const answers = [
      { id: 1, value: true, category: 'HUM', weight: 0.9 },
      { id: 2, value: true, category: 'HUM', weight: 0.8 },
      { id: 3, value: false, category: 'STEM', weight: 0.7 }
    ];

    const q = getNextQuestion(answers);
    expect(q.category).toBe('HUM');
  });

  test('Maneja empates correctamente', () => {
    const answers = [
      { id: 1, value: true, category: 'ART', weight: 0.8 },
      { id: 2, value: true, category: 'SOC', weight: 0.8 },
      { id: 3, value: true, category: 'STEM', weight: 0.8 }
    ];

    const q = getNextQuestion(answers);
    // Debería elegir entre ART, SOC o STEM, pero priorizando la menos explorada
    expect(['ART', 'SOC', 'STEM']).toContain(q.category);
  });
});