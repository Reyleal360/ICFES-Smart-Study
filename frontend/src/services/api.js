import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para agregar token JWT si existe
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const examService = {
  getMyExams: () => api.get('/exams'),
  getExamById: (id) => api.get(`/exams/${id}`),
  generateExam: (data) => api.post('/exams/generate', data),
  submitExam: (id, answers) => api.put(`/exams/${id}/submit`, { answers }),
  getRecommendations: () => api.get('/exams/recommendations'),
  chatWithTutor: (history, message) => api.post('/exams/chat', { history, message }),
};

export default api;
