// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
  MEALS: `${API_BASE_URL}/api/meals`,
  NUTRITION: `${API_BASE_URL}/api/nutrition`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  RECIPES: `${API_BASE_URL}/api/recipes`,
};

export default API_BASE_URL;
