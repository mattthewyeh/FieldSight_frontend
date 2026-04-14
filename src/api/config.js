// src/api/config.js
export const API_BASE = "https://api.fieldsightproject.com"; // Or your local backend URL

export const ENDPOINTS = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  ROVER_DATA: (id) => `${API_BASE}/rover/telemetry/latest/${id}`,
  START_ROVER: `${API_BASE}/rover/start`,
  STOP_ROVER: (sessionId) => `${API_BASE}/rover/stop/${sessionId}`,
  SCANS: (sessionId) => `${API_BASE}/scans/${sessionId}`
};