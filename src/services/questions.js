// src/services/questions.js
export const questions = [
    // Categoría: STEM
    { id: 1,  text: "¿Disfrutas resolver problemas matemáticos?",              category: "STEM", weight: 0.8 },
    { id: 2,  text: "¿Te interesa la programación y el desarrollo de software?",  category: "STEM", weight: 0.9 },
    { id: 3,  text: "¿Te atraen los retos lógicos y de razonamiento?",          category: "STEM", weight: 0.85 },
    { id: 4,  text: "¿Te gusta explorar conceptos de física y química?",        category: "STEM", weight: 0.75 },
    { id: 5,  text: "¿Disfrutas trabajar con datos y estadísticas?",           category: "STEM", weight: 0.8 },
    { id: 6,  text: "¿Te interesa la inteligencia artificial y el aprendizaje automático?", category: "STEM", weight: 0.9 },
    { id: 7,  text: "¿Disfrutas montar y solucionar circuitos electrónicos?", category: "STEM", weight: 0.85 },
    { id: 8,  text: "¿Te gusta diseñar algoritmos para resolver problemas?",   category: "STEM", weight: 0.8 },
    { id: 9,  text: "¿Te atrae la investigación científica?",                  category: "STEM", weight: 0.9 },
    { id: 10, text: "¿Disfrutas construir prototipos tecnológicos?",           category: "STEM", weight: 0.85 },
  
    // Categoría: HUM (Humanidades)
    { id: 11, text: "¿Te apasiona la lectura de literatura clásica?",         category: "HUM", weight: 0.6 },
    { id: 12, text: "¿Disfrutas escribir ensayos y reflexiones?",             category: "HUM", weight: 0.7 },
    { id: 13, text: "¿Te interesa la filosofía y el pensamiento crítico?",   category: "HUM", weight: 0.65 },
    { id: 14, text: "¿Te gusta analizar eventos históricos?",                category: "HUM", weight: 0.6 },
    { id: 15, text: "¿Disfrutas aprender idiomas extranjeros?",              category: "HUM", weight: 0.7 },
    { id: 16, text: "¿Te apasiona la sociología y entender la sociedad?",      category: "HUM", weight: 0.65 },
    { id: 17, text: "¿Disfrutas debatir temas políticos y sociales?",         category: "HUM", weight: 0.7 },
    { id: 18, text: "¿Te interesa la psicología humana?",                     category: "HUM", weight: 0.65 },
    { id: 19, text: "¿Te atrae la lingüística y la gramática?",                category: "HUM", weight: 0.6 },
    { id: 20, text: "¿Disfrutas investigar culturas y tradiciones?",          category: "HUM", weight: 0.7 },
  
    // Categoría: NAT (Naturaleza)
    { id: 21, text: "¿Te gusta trabajar al aire libre?",                     category: "NAT", weight: 0.5 },
    { id: 22, text: "¿Disfrutas estudiar animales y biología?",               category: "NAT", weight: 0.6 },
    { id: 23, text: "¿Te interesa la conservación del medio ambiente?",       category: "NAT", weight: 0.55 },
    { id: 24, text: "¿Disfrutas cultivar plantas o jardinería?",             category: "NAT", weight: 0.5 },
    { id: 25, text: "¿Te apasiona la geología y el estudio de la Tierra?",     category: "NAT", weight: 0.6 },
    { id: 26, text: "¿Disfrutas actividades relacionadas con la agricultura?", category: "NAT", weight: 0.55 },
    { id: 27, text: "¿Te interesa la meteorología y el clima?",               category: "NAT", weight: 0.6 },
    { id: 28, text: "¿Disfrutas acampar y explorar la naturaleza?",           category: "NAT", weight: 0.5 },
    { id: 29, text: "¿Te atrae la ecología y los ecosistemas?",               category: "NAT", weight: 0.6 },
    { id: 30, text: "¿Disfrutas trabajar en proyectos de sostenibilidad?",     category: "NAT", weight: 0.55 },
  
    // Categoría: ART (Artes)
    { id: 31, text: "¿Te atrae la pintura y el dibujo artístico?",             category: "ART", weight: 0.7 },
    { id: 32, text: "¿Disfrutas la escultura y el modelado?",                 category: "ART", weight: 0.8 },
    { id: 33, text: "¿Te interesa el diseño gráfico y digital?",              category: "ART", weight: 0.75 },
    { id: 34, text: "¿Disfrutas la fotografía y la edición de imágenes?",      category: "ART", weight: 0.8 },
    { id: 35, text: "¿Te apasiona el cine y la producción audiovisual?",        category: "ART", weight: 0.9 },
    { id: 36, text: "¿Disfrutas la música y la composición musical?",          category: "ART", weight: 0.85 },
    { id: 37, text: "¿Te interesa la danza y el movimiento corporal?",         category: "ART", weight: 0.75 },
    { id: 38, text: "¿Disfrutas el diseño de moda y la confección?",           category: "ART", weight: 0.8 },
    { id: 39, text: "¿Te atrae la ilustración y el storyboard?",               category: "ART", weight: 0.85 },
    { id: 40, text: "¿Disfrutas la creatividad publicitaria y el marketing visual?", category: "ART", weight: 0.8 },
  
    // Categoría: SOC (Sociales)
    { id: 41, text: "¿Disfrutas trabajar en equipo y colaborar con otros?",     category: "SOC", weight: 0.6 },
    { id: 42, text: "¿Te interesa el trabajo social y la ayuda comunitaria?",  category: "SOC", weight: 0.7 },
    { id: 43, text: "¿Disfrutas liderar grupos y proyectos?",                  category: "SOC", weight: 0.65 },
    { id: 44, text: "¿Te apasiona la comunicación y el periodismo?",           category: "SOC", weight: 0.7 },
    { id: 45, text: "¿Disfrutas negociar y mediar conflictos?",                category: "SOC", weight: 0.6 },
    { id: 46, text: "¿Te interesa la gestión de recursos humanos?",            category: "SOC", weight: 0.65 },
    { id: 47, text: "¿Disfrutas la enseñanza y la formación de personas?",     category: "SOC", weight: 0.7 },
    { id: 48, text: "¿Te atrae el derecho y la justicia social?",              category: "SOC", weight: 0.6 },
    { id: 49, text: "¿Disfrutas organizar eventos y actividades grupales?",    category: "SOC", weight: 0.65 },
    { id: 50, text: "¿Te interesa la psicopedagogía y la orientación educativa?", category: "SOC", weight: 0.7 }
  ];