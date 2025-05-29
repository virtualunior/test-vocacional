// src/services/careerProfiles.js

export const careerProfiles = {
    'Medicina': {
        description: "Forma profesionales capaces de diagnosticar, tratar y prevenir enfermedades, con un fuerte compromiso social y ético.",
        keywords: ["salud", "cuidado", "investigación", "humanidad", "diagnóstico"],
        idealProfile: {
            EXPLORADOR: 0.8, // Investigación, diagnóstico, ciencia
            HACEDOR: 0.5,    // Procedimientos, habilidades manuales (cirugía)
            COMUNICADOR: 0.9, // Empatía, trato con pacientes, comunicación
            ORGANIZADOR: 0.6, // Gestión de casos, planificación de tratamientos
            CREATIVO: 0.3    // Resolución de problemas innovadora, pero no el enfoque principal
        },
        motivations: [
            "Si te apasiona la ciencia y tienes una vocación profunda por cuidar y sanar a las personas.",
            "Si te ves investigando y encontrando soluciones a los desafíos de la salud humana."
        ]
    },
    'Odontología': {
        description: "Especialistas en la salud bucal, realizando diagnósticos, tratamientos y previniendo enfermedades dentales y orales.",
        keywords: ["salud bucal", "diagnóstico", "procedimientos", "precisión", "estética"],
        idealProfile: {
            EXPLORADOR: 0.7, // Diagnóstico, conocimiento biológico
            HACEDOR: 0.9,    // Gran habilidad manual, procedimientos dentales
            COMUNICADOR: 0.8, // Trato con pacientes, explicar tratamientos
            ORGANIZADOR: 0.5, // Gestión de consultorio
            CREATIVO: 0.6    // Estética dental, diseño de sonrisas
        },
        motivations: [
            "Si disfrutas del trabajo manual preciso y te interesa mejorar la salud y estética bucal de las personas.",
            "Si eres detallista y te apasiona transformar sonrisas."
        ]
    },
    'Enfermería': {
        description: "Profesionales esenciales en el cuidado directo de pacientes, administrando tratamientos, asistiendo a médicos y brindando apoyo emocional.",
        keywords: ["cuidado", "asistencia", "pacientes", "empatía", "organización"],
        idealProfile: {
            EXPLORADOR: 0.5, // Conocimiento médico, pero menos investigación
            HACEDOR: 0.7,    // Aplicación de tratamientos, procedimientos
            COMUNICADOR: 0.9, // Comunicación directa con pacientes y familiares, trabajo en equipo
            ORGANIZADOR: 0.8, // Gestión de turnos, expedientes, recursos
            CREATIVO: 0.2    // Menos relevancia directa
        },
        motivations: [
            "Si tu vocación es el servicio y te sientes llamado(a) a cuidar y apoyar a las personas en sus momentos más vulnerables.",
            "Si eres organizado(a) y te adaptas bien a entornos dinámicos para brindar atención de calidad."
        ]
    },
    'Derecho': {
        description: "Forma abogados capaces de interpretar y aplicar leyes, defender derechos y buscar justicia en diversos ámbitos.",
        keywords: ["justicia", "leyes", "argumentación", "análisis", "negociación"],
        idealProfile: {
            EXPLORADOR: 0.7, // Análisis de casos, investigación legal
            HACEDOR: 0.3,    // Menos enfoque manual
            COMUNICADOR: 0.9, // Oratoria, debate, negociación, persuasión
            ORGANIZADOR: 0.9, // Estructura legal, gestión de casos, lógica normativa
            CREATIVO: 0.5    // Estrategias argumentativas, soluciones innovadoras
        },
        motivations: [
            "Si te apasiona la justicia social, el debate y tienes una mente analítica para las leyes.",
            "Si disfrutas la argumentación y la búsqueda de soluciones basadas en la lógica y la ética."
        ]
    },
    'Gastronomía, Turismo y Hotelería': {
        description: "Combina la creatividad culinaria con la gestión de experiencias en servicios turísticos y hoteleros.",
        keywords: ["gastronomía", "turismo", "hospitalidad", "creatividad", "gestión", "servicio"],
        idealProfile: {
            EXPLORADOR: 0.4, // Investigación de tendencias, pero menor
            HACEDOR: 0.7,    // Habilidades culinarias, operativas
            COMUNICADOR: 0.9, // Atención al cliente, comunicación intercultural
            ORGANIZADOR: 0.8, // Gestión de eventos, personal, logística
            CREATIVO: 0.9    // Creación de platillos, diseño de experiencias, innovación en servicio
        },
        motivations: [
            "Si eres una persona creativa, te encanta el servicio al cliente y te apasiona crear experiencias inolvidables.",
            "Si disfrutas la gestión de proyectos dinámicos en un entorno donde la hospitalidad es clave."
        ]
    },
    'Ingeniería de Sistemas': {
        description: "Diseña, desarrolla e implementa soluciones tecnológicas y sistemas de software para resolver problemas complejos.",
        keywords: ["programación", "lógica", "tecnología", "innovación", "análisis"],
        idealProfile: {
            EXPLORADOR: 0.9, // Resolución lógica de problemas, investigación de nuevas tecnologías
            HACEDOR: 0.8,    // Construcción de código, implementación de sistemas
            COMUNICADOR: 0.6, // Trabajo en equipo, explicar soluciones técnicas
            ORGANIZADOR: 0.7, // Gestión de proyectos, estructura de sistemas
            CREATIVO: 0.7    // Soluciones innovadoras, diseño de software
        },
        motivations: [
            "Si tu mente es lógica y te apasiona construir y diseñar soluciones tecnológicas para el futuro.",
            "Si disfrutas el desafío de resolver problemas complejos usando código y la innovación constante."
        ]
    },
    'Administración de Empresas': {
        description: "Prepara para liderar y gestionar organizaciones, optimizando recursos y tomando decisiones estratégicas para el éxito empresarial.",
        keywords: ["gestión", "negocios", "liderazgo", "estrategia", "finanzas"],
        idealProfile: {
            EXPLORADOR: 0.6, // Análisis de mercado, investigación de oportunidades
            HACEDOR: 0.4,    // Menos enfoque manual
            COMUNICADOR: 0.7, // Liderazgo, comunicación con equipos y stakeholders
            ORGANIZADOR: 0.9, // Planificación estratégica, gestión de recursos, toma de decisiones
            CREATIVO: 0.6    // Innovación en modelos de negocio, marketing
        },
        motivations: [
            "Si te ves liderando equipos, tomando decisiones estratégicas y tienes una visión para el crecimiento empresarial.",
            "Si te apasiona el mundo de los negocios y la optimización de recursos para alcanzar el éxito."
        ]
    },
    'Auditoría': {
        description: "Evalúa y verifica la información financiera y operativa de organizaciones para asegurar su fiabilidad y cumplimiento normativo.",
        keywords: ["finanzas", "análisis", "normativas", "precisión", "ética", "cumplimiento"],
        idealProfile: {
            EXPLORADOR: 0.7, // Análisis de datos, investigación de anomalías
            HACEDOR: 0.3,    // Menos enfoque manual
            COMUNICADOR: 0.6, // Comunicación de hallazgos, entrevistas
            ORGANIZADOR: 0.95, // Meticulosidad, cumplimiento de normas, estructuración de información
            CREATIVO: 0.3    // Menos relevancia directa, más en la resolución de inconsistencias
        },
        motivations: [
            "Si eres una persona metódica, con gran atención al detalle y un fuerte sentido de la ética y el cumplimiento.",
            "Si disfrutas analizar información financiera y asegurar la transparencia y la integridad en las organizaciones."
        ]
    }
};