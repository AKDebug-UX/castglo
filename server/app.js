require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const config = require('./config/env');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Initialize services
const { initEmailService } = require('./services/emailService');
const { initCloudinary } = require('./services/cloudinaryService');

initEmailService();
initCloudinary();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
});

app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: [config.FRONTEND_URL, config.MOBILE_APP_URL],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation endpoint
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api-docs.json',
    displayOperationId: false,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
  },
  customCss: '.topbar { display: none }',
  customSiteTitle: 'Castglo API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API version prefix
const API_PREFIX = config.API_PREFIX;

// Routes
app.use(`${API_PREFIX}/auth`, authLimiter, require('./routes/authRoutes'));
app.use(`${API_PREFIX}/leads`, require('./routes/leadRoutes'));
app.use(`${API_PREFIX}/users`, require('./routes/userRoutes'));
app.use(`${API_PREFIX}/profiles`, require('./routes/profileRoutes'));
app.use(`${API_PREFIX}/casting-calls`, require('./routes/castingCallRoutes'));
app.use(`${API_PREFIX}/applications`, require('./routes/applicationRoutes'));
app.use(`${API_PREFIX}/subscriptions`, require('./routes/subscriptionRoutes'));
app.use(`${API_PREFIX}/admin`, require('./routes/adminRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Castglo API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
