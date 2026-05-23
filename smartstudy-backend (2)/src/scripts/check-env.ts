#!/usr/bin/env node
/**
 * SmartStudy Backend Startup Diagnostic
 * Run this before starting the server to verify everything is configured
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 SmartStudy Backend Startup Check\n');

const checks = {
  'Node Version': () => {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    return { pass: major >= 18, value: version, required: '>= 18' };
  },
  'PORT': () => {
    const port = process.env.PORT;
    return { pass: !!port, value: port || 'NOT SET', required: '5000' };
  },
  'NODE_ENV': () => {
    const env = process.env.NODE_ENV;
    return { pass: !!env, value: env || 'NOT SET', required: 'development/production' };
  },
  'MONGODB_URI': () => {
    const uri = process.env.MONGODB_URI;
    const valid = uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
    return { pass: valid, value: uri ? 'Set (hidden)' : 'NOT SET', required: 'mongodb+srv://...' };
  },
  'JWT_SECRET': () => {
    const secret = process.env.JWT_SECRET;
    const valid = secret && secret.length >= 32;
    return { pass: valid, value: secret ? `${secret.length} chars` : 'NOT SET', required: '>= 32 chars' };
  },
  'JWT_REFRESH_SECRET': () => {
    const secret = process.env.JWT_REFRESH_SECRET;
    const valid = secret && secret.length >= 32;
    return { pass: valid, value: secret ? `${secret.length} chars` : 'NOT SET', required: '>= 32 chars' };
  },
  'CLIENT_URL': () => {
    const url = process.env.CLIENT_URL;
    return { pass: !!url, value: url || 'NOT SET', required: 'http://localhost:5173' };
  },
  'Stripe': () => {
    const key = process.env.STRIPE_SECRET_KEY;
    return { pass: true, value: key ? 'Enabled' : 'Disabled (Mock)', required: 'Optional' };
  },
  'SMTP Email': () => {
    const user = process.env.SMTP_USER;
    return { pass: true, value: user ? 'Enabled' : 'Disabled (Console)', required: 'Optional' };
  },
  'OpenAI': () => {
    const key = process.env.OPENAI_API_KEY;
    return { pass: true, value: key ? 'Enabled' : 'Disabled', required: 'Optional' };
  },
  'Gemini': () => {
    const key = process.env.GEMINI_API_KEY;
    return { pass: true, value: key ? 'Enabled' : 'Disabled', required: 'Optional' };
  },
};

let passed = 0;
let failed = 0;

for (const [name, check] of Object.entries(checks)) {
  const result = check();
  const icon = result.pass ? '✅' : '❌';
  const status = result.pass ? 'PASS' : 'FAIL';
  console.log(`${icon} ${name.padEnd(20)} | ${status} | Value: ${result.value} | Required: ${result.required}`);
  if (result.pass) passed++; else failed++;
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Please fix the failed checks before starting the server.');
  console.log('   Edit your .env file and ensure all required variables are set.\n');
  process.exit(1);
} else {
  console.log('✅ All checks passed! You can start the server with: npm run dev\n');
  process.exit(0);
}
