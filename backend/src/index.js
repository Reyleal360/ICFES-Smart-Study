import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Rutas
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';

dotenv.config();

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(express.json());

// Conexión a base de datos
connectDB();

// Endpoints básicos
app.get('/', (req, res) => {
  res.send('API ICFES Smart Study funcionando');
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
