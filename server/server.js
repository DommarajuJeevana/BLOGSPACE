import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();
connectDB();

const app = express();

/* ✅ FIXED CORS (this removes network error issues) */
app.use(
  cors({
    origin: [
      "https://blogspace-dommarajujeevana.vercel.app",
      "https://blogspace-git-main-dommarajujeevanas-projects.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

/* Test route */
app.get('/', (req, res) => {
  res.json({ message: 'BlogSpace API is running' });
});

/* Error handler */
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

/* Start server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});