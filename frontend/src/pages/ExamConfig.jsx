import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../services/api';
import { motion } from 'framer-motion';
import { Settings, Play, BrainCircuit } from 'lucide-react';

const ExamConfig = () => {
  const [formData, setFormData] = useState({
    subject: 'Matemáticas',
    topics: '',
    difficulty: 'Intermedio',
    count: 5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await examService.generateExam({
        ...formData,
        count: parseInt(formData.count)
      });
      navigate(`/exam/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar el simulacro');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-100 p-3 rounded-xl">
            <Settings className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurar Simulacro</h1>
            <p className="text-gray-500">Personaliza tu prueba y deja que la IA genere las preguntas</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option>Matemáticas</option>
                <option>Lectura Crítica</option>
                <option>Ciencias Naturales</option>
                <option>Sociales y Ciudadanas</option>
                <option>Inglés</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Preguntas</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
              >
                <option value="5">5 Preguntas (Rápido)</option>
                <option value="10">10 Preguntas (Medio)</option>
                <option value="20">20 Preguntas (Completo)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temas Específicos</label>
            <textarea
              required
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ej: Álgebra lineal, trigonometría básica, funciones..."
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">Escribe los temas que deseas reforzar.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dificultad</label>
            <div className="flex gap-4">
              {['Básico', 'Intermedio', 'Avanzado'].map((level) => (
                <label key={level} className="flex-1">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={formData.difficulty === level}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="peer hidden"
                  />
                  <div className="text-center py-3 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:bg-gray-50 transition-all font-medium text-gray-600">
                    {level}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <BrainCircuit className="h-5 w-5 animate-pulse" />
                  Generando con IA...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Comenzar Simulacro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ExamConfig;
