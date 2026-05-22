import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  justification: { type: String, required: true }
});

const mockExamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  subject: { type: String, required: true },
  topics: { type: String, required: true },
  difficulty: { type: String, required: true },
  questions: [questionSchema],
  score: { type: Number, default: null },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const MockExam = mongoose.model('MockExam', mockExamSchema);
export default MockExam;
