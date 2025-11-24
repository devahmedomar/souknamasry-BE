import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { ResponseUtil } from './utils/response.util.js';
import { AppError } from './utils/errors/AppError.js';
import { HttpStatusCode } from './utils/errors/error.types.js';
import { i18nMiddleware } from './middleware/i18n.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// i18n middleware - Detect and set user's preferred language
app.use(i18nMiddleware);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Global error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    return ResponseUtil.error(
      res,
      err.message,
      undefined,
      process.env.NODE_ENV === 'development' ? err.stack : undefined,
      err.statusCode
    );
  }

  // Handle unexpected errors
  return ResponseUtil.error(
    res,
    'An unexpected error occurred',
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    HttpStatusCode.INTERNAL_SERVER_ERROR
  );
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

export default app;
