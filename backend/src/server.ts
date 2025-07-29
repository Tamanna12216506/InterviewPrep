import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import performanceRoutes from './routes/performance';
import { authenticateToken } from './middleware/auth';
import geminiRoute from './routes/geminiRoute';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000" || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tamannayadav741:Tamanna@cluster0.abcrmr1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api', geminiRoute);  // Now available at http://localhost:5000/api/test-gemini
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/performance', performanceRoutes);

// Socket.IO for real-time mock interviews
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // Add token verification logic here
  next();
});

io.on('connection', (socket) => {
  console.log('User connected for mock interview:', socket.id);
  
  socket.on('join-interview', (data) => {
    socket.join(data.interviewId);
    socket.to(data.interviewId).emit('user-joined', {
      userId: socket.id,
      username: data.username
    });
  });

  socket.on('interview-message', (data) => {
    socket.to(data.interviewId).emit('interview-message', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('code-change', (data) => {
    socket.to(data.interviewId).emit('code-change', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;