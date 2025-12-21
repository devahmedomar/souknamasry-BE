import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet, { type HelmetOptions } from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { cartRoutes } from './routes/cartRoutes.js';

import { ResponseUtil } from './utils/response.util.js';
import { AppError } from './utils/errors/AppError.js';
import { HttpStatusCode } from './utils/errors/error.types.js';
import { i18nMiddleware } from './middleware/i18n.js';

const app = express();

// Security middleware with Swagger-friendly configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://souknamasry-be.vercel.app']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// i18n middleware - Detect and set user's preferred language
app.use(i18nMiddleware);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Souknamasry API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha'
  }
}));

// Swagger JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

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
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);


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
