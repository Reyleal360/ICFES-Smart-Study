import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to Atlas MongoDB: ${error.message}`);
    console.warn(`Intentando iniciar conexión a MongoDB en memoria (Memory Server)...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB In-Memory conectado exitosamente: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`No se pudo iniciar MongoDB en memoria: ${memErr.message}`);
    }
  }
};

export default connectDB;


