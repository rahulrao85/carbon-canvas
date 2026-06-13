/**
 * @module config/constants
 * @fileoverview Application-wide configuration constants.
 */
import dotenv from 'dotenv';
dotenv.config();

/** @constant {number} PORT - Server port (default 8080). */
export const PORT = process.env.PORT || 8080;

/** @constant {string} OPENROUTER_API_KEY - API key for OpenRouter AI service. */
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

/** @constant {string} OPENROUTER_MODEL - Model ID for OpenRouter AI service. */
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct';

/** @constant {string} OPENROUTER_BASE_URL - Base URL for OpenRouter chat completions. */
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** @constant {number} AI_TIMEOUT - Request timeout for AI calls in ms. */
export const AI_TIMEOUT = 15000;

/** @constant {number} RATE_LIMIT_WINDOW_MS - Window size for rate limiting in ms. */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/** @constant {number} RATE_LIMIT_MAX - Maximum requests per window. */
export const RATE_LIMIT_MAX = 30;

/** @constant {string} PAYLOAD_LIMIT - Maximum JSON payload size. */
export const PAYLOAD_LIMIT = '16kb';
