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
import { addressRoutes } from './routes/addressRoutes.js';
import { orderRoutes } from './routes/orderRoutes.js';
import { favouriteRoutes } from './routes/favouriteRoutes.js';
import userRoutes from './routes/userRoutes.js';

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
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
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
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/users', userRoutes);


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
