import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import routes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// CORS hỗ trợ Credentials cho Client React Vite (Port 5173)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Cho phép truyền HttpOnly Cookie qua các domain khác nhau
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Đọc HttpOnly Cookie từ client gửi lên

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api', routes);
app.use('/api/auth', authRoutes);

export default app;
