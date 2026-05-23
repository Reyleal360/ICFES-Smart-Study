import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Award, Brain, Clock, ChevronRight, Lightbulb, Target, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { examService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [examsRes, recsRes] = await Promise.all([
        examService.getMyExams(),
        examService.getRecommendations()
      ]);
      setExams(examsRes.data);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Evitar que navegue al examen
    if (window.confirm('¿Estás seguro de que deseas eliminar este simulacro? Esta acción no se puede deshacer y afectará tu promedio.')) {
      try {
        await examService.deleteExam(id);
        fetchData(); // Recargar datos
      } catch (error) {
        console.error("Error al eliminar el simulacro:", error);
        alert("No se pudo eliminar el simulacro.");
      }
    }
  };

  const completedExams = exams.filter(e => e.isCompleted);
  const avgScore = completedExams.length > 0 
    ? Math.round(completedExams.reduce((acc, curr) => acc + curr.score, 0) / completedExams.length)
    : 0;
  
  const totalQuestions = completedExams.reduce((acc, curr) => acc + curr.questions.length, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen de tu progreso en el ICFES</p>
        </div>
        <button 
          onClick={() => navigate('/config-exam')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          Nuevo Simulacro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-primary-200 transition-colors">
          <div className="bg-blue-50 p-3 rounded-xl">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Puntaje Promedio</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgScore} <span className="text-sm font-normal text-gray-400">/ 500</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-primary-200 transition-colors">
          <div className="bg-green-50 p-3 rounded-xl">
            <Brain className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Simulacros Completados</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{completedExams.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-primary-200 transition-colors">
          <div className="bg-purple-50 p-3 rounded-xl">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Preguntas Resueltas</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalQuestions}</h3>
          </div>
        </div>
      </div>

      {/* Recomendaciones Inteligentes */}
      {!loading && recommendations && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Recomendación de tu Tutor IA</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{recommendations.message}</p>
              
              {recommendations.topicsToReview && recommendations.topicsToReview.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Temas sugeridos para reforzar:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.topicsToReview.map((topic, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-sm font-medium text-blue-700 shadow-sm">
                        <Target className="h-4 w-4" /> {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Tus Simulacros</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando...</div>
        ) : exams.length === 0 ? (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            Aún no has realizado simulacros. ¡Comienza uno ahora!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {exams.map(exam => (
              <div 
                key={exam._id} 
                onClick={() => navigate(`/exam/${exam._id}`)}
                className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    {exam.subject}
                    {exam.isCompleted ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Completado</span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Temas: {exam.topics}</p>
                  <p className="text-xs text-gray-400 mt-1">Generado el {new Date(exam.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  {exam.isCompleted && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-medium">Puntaje</p>
                      <p className="font-bold text-primary-600 text-lg">{exam.score}/500</p>
                    </div>
                  )}
                  <button 
                    onClick={(e) => handleDelete(e, exam._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar simulacro"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
