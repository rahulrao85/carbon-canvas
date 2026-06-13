import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const AI_TIMEOUT = 15000;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 30;
export const PAYLOAD_LIMIT = '16kb';
