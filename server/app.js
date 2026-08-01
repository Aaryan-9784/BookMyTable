/**
 * Express application: security headers, CORS, JSON body, routes, error handler.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import restaurantRoutes from './routes/restaurantRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import restaurantDashboardRoutes from './routes/restaurantDashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import devAuthRoutes from './routes/devAuthRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { cookieParser, csrfErrorHandler } from './middleware/csrfProtection.js';

const app = express();

// Trust proxy when deployed behind ALB/API Gateway (adjust if needed)
app.set('trust proxy', 1);

// Security headers with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for React
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:", "blob:"], // Allow images from CDNs
      connectSrc: ["'self'", "https://api.bookmytable.me", "https://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

const allowedOrigins = [
  "https://main.dbiw5toctstwg.amplifyapp.com",
  "https://bookmytable.me",
  "https://www.bookmytable.me",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any localhost port in development
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.options("*", cors());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser()); // Required for CSRF protection

// Apply general rate limiting to all routes (100 requests per 15 minutes per IP)
app.use(generalLimiter);

// Enhanced health check endpoint
app.get('/health', async (_req, res) => {
  const { isDatabaseConnected, checkDatabaseHealth } = await import('./config/db.js');
  const { isRedisConnected, checkRedisHealth } = await import('./config/redis.js');
  
  const dbHealth = isDatabaseConnected() ? await checkDatabaseHealth() : { status: 'disconnected' };
  const redisHealth = isRedisConnected() ? await checkRedisHealth() : { status: 'disconnected' };
  
  const isHealthy = dbHealth.status === 'healthy';
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'bookmytable-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    redis: redisHealth,
  });
});

// Route-specific rate limiting and CSRF protection is applied within each route file
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurant-dashboard', restaurantDashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Development-only authentication routes (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev-auth', devAuthRoutes);
}

app.use(notFoundHandler);
app.use(csrfErrorHandler); // Handle CSRF errors before general error handler
app.use(errorHandler);

export default app;
