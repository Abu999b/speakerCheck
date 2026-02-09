import axios from 'axios';

const API_URL = 'https://speakercheckbnd.onrender.com' || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Page APIs
export const pageAPI = {
  getAll: () => api.get('/pages'),
  create: (pageData) => api.post('/pages', pageData),
  update: (id, pageData) => api.put(`/pages/${id}`, pageData),
  delete: (id) => api.delete(`/pages/${id}`)
};

// Speaker APIs
export const speakerAPI = {
  getAll: (pageId) => api.get('/speakers', { params: { pageId } }),
  getById: (id) => api.get(`/speakers/${id}`),
  create: (speakerData) => api.post('/speakers', speakerData),
  update: (id, speakerData) => api.put(`/speakers/${id}`, speakerData),
  updateAvailability: (id, availabilityData) => 
    api.patch(`/speakers/${id}/availability`, availabilityData),
  delete: (id) => api.delete(`/speakers/${id}`)
};

export default api;
