import dotenv from 'dotenv';
import logger from '../utils/logger'

// Load .env file
dotenv.config();

// Required environment variables
const requiredVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

// Optional variables with defaults
const optionalVars = {
  NODE_ENV: 'development',
  JWT_EXPIRE: '15m',
  JWT_REFRESH_EXPIRE: '7d',
  LOG_LEVEL: 'debug',
  BCRYPT_SALT_ROUNDS: '12',
  MAX_REQUEST_SIZE: '10mb',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
};

export function validateEnv(): void {
  const missing: string[] = [];

  // Check required vars
  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Set defaults for optional vars
  for (const [key, defaultValue] of Object.entries(optionalVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      logger.warn(`Using default value for ${key}: ${defaultValue}`);
    }
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI || '';
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    logger.error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
    process.exit(1);
  }

  // Warn about default JWT secrets in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 32) {
      logger.error('JWT_SECRET is too short for production. Must be at least 32 characters.');
      process.exit(1);
    }
    if (jwtSecret.includes('change_this') || jwtSecret.includes('default')) {
      logger.error('JWT_SECRET appears to be a default value. Change it for production!');
      process.exit(1);
    }
  }

  // Log configuration summary
  logger.info('Environment validation passed');
  logger.info(`Node Environment: ${process.env.NODE_ENV}`);
  logger.info(`Server Port: ${process.env.PORT}`);
  logger.info(`Client URL: ${process.env.CLIENT_URL}`);
  logger.info(`MongoDB: ${mongoUri.includes('mongodb+srv') ? 'Atlas (Cloud)' : 'Local'}`);
  logger.info(`Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Enabled' : 'Disabled (Mock Mode)'}`);
  logger.info(`Email: ${process.env.SMTP_USER ? 'Enabled' : 'Disabled (Console Only)'}`);
  logger.info(`AI/OpenAI: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled'}`);
  logger.info(`AI/Gemini: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
}
