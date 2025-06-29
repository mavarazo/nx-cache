import express from 'express';
import { errorHandler } from './middlewares/error';
import cache from './routes/cache';

const app = express();

// app.use(express.json());

// Routes
app.use('/v1/cache', cache);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
