import OpenAI from 'openai';

const generateQuestions = async (subject, topics, difficulty, count) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Actúa como un experto evaluador del ICFES en Colombia.
Tu tarea es generar ${count} preguntas de opción múltiple sobre la materia "${subject}", enfocándote en los siguientes temas: "${topics}".
La dificultad debe ser "${difficulty}".

Debes devolver EXACTAMENTE un JSON con la siguiente estructura, sin texto adicional antes o después:
[
  {
    "question": "Texto de la pregunta...",
    "options": ["A. Opción 1", "B. Opción 2", "C. Opción 3", "D. Opción 4"],
    "correctAnswer": 1, // El índice de la opción correcta (0 a 3)
    "justification": "Explicación detallada de por qué esta es la respuesta correcta y por qué las demás no lo son, basada en competencias ICFES."
  }
]
Asegúrate de que las preguntas evalúen competencias y pensamiento crítico, al estilo real del ICFES.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultText = response.choices[0].message.content;
    const questions = JSON.parse(resultText);
    return questions;
  } catch (error) {
    console.error("Error generating questions with OpenAI:", error);
    throw new Error("No se pudieron generar las preguntas. Inténtalo de nuevo.");
  }
};

const getRecommendations = async (recentExams) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const prompt = `Actúa como un tutor experto del ICFES. A continuación te doy el resumen de los últimos simulacros de un estudiante:
${JSON.stringify(recentExams.map(e => ({ subject: e.subject, topics: e.topics, score: e.score })), null, 2)}

Analiza estos datos, detecta temas débiles (puntajes bajos) y genera una recomendación breve, amigable y motivadora de estudio (máximo 4 líneas) y una lista de 3 temas muy específicos para reforzar.

Devuelve EXACTAMENTE este JSON:
{
  "message": "Mensaje motivador e identificador de fallas...",
  "topicsToReview": ["Tema 1", "Tema 2", "Tema 3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return {
      message: "Sigue practicando realizando más simulacros para que la IA pueda darte recomendaciones precisas.",
      topicsToReview: ["Lectura Crítica general", "Matemáticas básicas", "Ciencias"]
    };
  }
};

const getChatResponse = async (history, currentMessage) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const systemPrompt = "Eres un tutor amigable y experto en las pruebas ICFES Saber 11 en Colombia. Ayudas a los estudiantes a entender conceptos, resolver dudas y mejorar su rendimiento. Tus respuestas deben ser claras, concisas y educativas.";
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(msg => ({ role: msg.isBot ? "assistant" : "user", content: msg.text })),
    { role: "user", content: currentMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error en el chatbot:", error);
    return "Lo siento, tuve un problema conectándome a mi base de conocimientos. ¿Podrías intentar de nuevo?";
  }
};

export default { generateQuestions, getRecommendations, getChatResponse };
