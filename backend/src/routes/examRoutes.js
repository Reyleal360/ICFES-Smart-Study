import express from 'express';
import { generateExam, getExamById, submitExam, getMyExams, getRecommendations, chatWithTutor } from '../controllers/examController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyExams);

router.route('/generate')
  .post(protect, generateExam);

router.route('/recommendations')
  .get(protect, getRecommendations);

router.route('/chat')
  .post(protect, chatWithTutor);

router.route('/:id')
  .get(protect, getExamById);

router.route('/:id/submit')
  .put(protect, submitExam);

export default router;
