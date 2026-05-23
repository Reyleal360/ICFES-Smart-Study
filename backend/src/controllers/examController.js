import MockExam from '../models/MockExam.js';
import openaiService from '../services/openaiService.js';
import axios from 'axios';

// @desc    Generar un nuevo simulacro usando IA
// @route   POST /api/exams/generate
// @access  Private
export const generateExam = async (req, res) => {
  try {
    const { subject, topics, difficulty, count } = req.body;

    // Generar preguntas usando OpenAI
    const generatedQuestions = await openaiService.generateQuestions(subject, topics, difficulty, count);

    // Crear el simulacro en la base de datos
    const mockExam = await MockExam.create({
      user: req.user._id,
      subject,
      topics,
      difficulty,
      questions: generatedQuestions
    });

    res.status(201).json(mockExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener simulacro por ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
  try {
    const exam = await MockExam.findById(req.params.id);

    if (exam && exam.user.toString() === req.user._id.toString()) {
      res.json(exam);
    } else {
      res.status(404).json({ message: 'Simulacro no encontrado o no autorizado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar simulacro por ID
// @route   DELETE /api/exams/:id
// @access  Private
export const deleteExam = async (req, res) => {
  try {
    const exam = await MockExam.findById(req.params.id);

    if (exam && exam.user.toString() === req.user._id.toString()) {
      await MockExam.deleteOne({ _id: exam._id });
      res.json({ message: 'Simulacro eliminado' });
    } else {
      res.status(404).json({ message: 'Simulacro no encontrado o no autorizado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Guardar resultados del simulacro
// @route   PUT /api/exams/:id/submit
// @access  Private
export const submitExam = async (req, res) => {
  try {
    const { answers } = req.body; // Array de respuestas seleccionadas (índices)
    const exam = await MockExam.findById(req.params.id);

    if (exam) {
      let correctCount = 0;
      exam.questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctCount++;
        }
      });

      // Calcular puntaje estilo ICFES (ejemplo simple: regla de 3 sobre 500)
      const score = Math.round((correctCount / exam.questions.length) * 500);

      exam.score = score;
      exam.isCompleted = true;
      const updatedExam = await exam.save();

      // Llamar al webhook de n8n para notificar el resultado (automatización Low Code)
      try {
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
        if (N8N_WEBHOOK_URL) {
          await axios.post(N8N_WEBHOOK_URL, {
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            examSubject: exam.subject,
            score: score
          });
          console.log("Webhook de n8n enviado correctamente.");
        }
      } catch (webhookError) {
        console.error("Error enviando webhook a n8n:", webhookError.message);
      }

      // Enviar datos a Google Sheets vía Google Apps Script (Low Code - AppSheet)
      try {
        const APPSCRIPT_WEBHOOK_URL = process.env.APPSCRIPT_WEBHOOK_URL;
        if (APPSCRIPT_WEBHOOK_URL && APPSCRIPT_WEBHOOK_URL !== 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
          const incorrectCount = exam.questions.length - correctCount;
          await axios.post(APPSCRIPT_WEBHOOK_URL, {
            nombre: req.user.name,
            email: req.user.email,
            materia: exam.subject,
            temas: exam.topics,
            dificultad: exam.difficulty,
            puntaje: score,
            totalPreguntas: exam.questions.length,
            correctas: correctCount,
            incorrectas: incorrectCount,
            fecha: new Date().toISOString()
          });
          console.log("Datos enviados a Google Sheets correctamente.");
        }
      } catch (sheetsError) {
        console.error("Error enviando datos a Google Sheets:", sheetsError.message);
      }

      res.json(updatedExam);
    } else {
      res.status(404).json({ message: 'Simulacro no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener todos los simulacros del usuario
// @route   GET /api/exams
// @access  Private
export const getMyExams = async (req, res) => {
  try {
    const exams = await MockExam.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener recomendaciones de estudio con IA
// @route   GET /api/exams/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    // Tomar los últimos 3 simulacros completados
    const exams = await MockExam.find({ user: req.user._id, isCompleted: true })
      .sort({ createdAt: -1 })
      .limit(3);

    if (exams.length === 0) {
      return res.json({
        message: "¡Bienvenido! Realiza tu primer simulacro para que pueda analizar tu desempeño y darte recomendaciones personalizadas.",
        topicsToReview: ["Cualquier materia para empezar"]
      });
    }

    const recommendations = await openaiService.getRecommendations(exams);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manejar respuestas del chatbot
// @route   POST /api/exams/chat
// @access  Private
export const chatWithTutor = async (req, res) => {
  try {
    const { history, message } = req.body;
    const botReply = await openaiService.getChatResponse(history || [], message);
    res.json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
