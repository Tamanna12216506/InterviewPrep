// src/lib/api.ts
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  ME: `${BASE_URL}/api/auth/me`,
  QUESTIONS: `${BASE_URL}/api/questions`,
  PERFORMANCE: `${BASE_URL}/api/performance`
};