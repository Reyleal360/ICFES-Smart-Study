import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Brain, Award, Volume2, Square, Loader2 } from 'lucide-react';

const ExamRunner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await examService.getExamById(id);
        setExam(response.data);
        if (response.data.isCompleted) {
          setIsSubmitted(true);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchExam();
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [id]);

  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [currentQuestion]);

  const speakText = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO'; // Español Colombia
    utterance.rate = 0.9;
    
    utterance.onend = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (optionIndex) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return; // Protección anti doble envío
    if (Object.keys(answers).length < exam.questions.length) {
      alert('Por favor responde todas las preguntas');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await examService.submitExam(id, Object.values(answers));
      setExam(response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-primary-600">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <h2 className="text-xl font-bold">Preparando tu simulacro...</h2>
      <p className="text-gray-500 mt-2">La IA está diseñando las preguntas</p>
    </div>
  );

  if (!exam) return <div className="text-center py-20 text-red-500">Simulacro no encontrado</div>;

  const question = exam.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  
  // Vista de resultados finales
  if (isSubmitted && currentQuestion === exam.questions.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados del Simulacro</h2>
          <p className="text-gray-500 mb-6">{exam.subject} - {exam.difficulty}</p>
          
          <div className="inline-block bg-primary-50 px-8 py-6 rounded-2xl">
            <p className="text-sm font-medium text-primary-600 mb-1">Tu Puntaje ICFES</p>
            <h1 className="text-5xl font-black text-primary-700">{exam.score} <span className="text-xl font-normal text-primary-400">/ 500</span></h1>
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={() => navigate('/')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors">
              Volver al Inicio
            </button>
            <button onClick={() => setCurrentQuestion(0)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Revisar Respuestas
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key={currentQuestion}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900">{exam.subject}</h2>
          <p className="text-sm text-gray-500">Pregunta {currentQuestion + 1} de {exam.questions.length}</p>
        </div>
        <div className="flex items-center gap-2">
          {exam.questions.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentQuestion === idx ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                ${isSubmitted 
                  ? (answers[idx] === exam.questions[idx].correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                  : (answers[idx] !== undefined ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500')
                }
              `}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 relative">
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => speakText(`${question.question}. Opciones: ${question.options.join('. ')}`)}
            className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
            title={isSpeaking ? "Detener Lectura" : "Leer en voz alta"}
          >
            {isSpeaking ? <Square className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
        
        <h3 className="text-xl text-gray-800 leading-relaxed font-medium mb-8 pr-12">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            let optionClass = "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700";
            
            if (isSelected) optionClass = "border-primary-500 bg-primary-50 text-primary-800 ring-1 ring-primary-500";
            
            if (isSubmitted) {
              if (idx === question.correctAnswer) {
                optionClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
              } else if (isSelected) {
                optionClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
              } else {
                optionClass = "border-gray-200 text-gray-400 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${optionClass}`}
              >
                <div className="mt-0.5">
                  {isSubmitted && idx === question.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {isSubmitted && isSelected && idx !== question.correctAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                  {(!isSubmitted || (!isSelected && idx !== question.correctAnswer)) && (
                    <div className={`h-5 w-5 rounded-full border-2 ${isSelected ? 'border-primary-600' : 'border-gray-300'}`}>
                      {isSelected && <div className="h-2.5 w-2.5 bg-primary-600 rounded-full m-0.5"></div>}
                    </div>
                  )}
                </div>
                <span className="flex-1 font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isSubmitted && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6 flex gap-4">
          <Brain className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Explicación de la IA:</h4>
            <p className="text-blue-800 leading-relaxed">{question.justification}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Anterior
        </button>

        {!isSubmitted && currentQuestion === exam.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Guardando...</>
            ) : (
              <>Finalizar Simulacro <CheckCircle2 className="h-5 w-5" /></>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={!isSubmitted && currentQuestion === exam.questions.length - 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitted && currentQuestion === exam.questions.length - 1 ? 'Ver Resultados Finales' : 'Siguiente'} <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ExamRunner;
