import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opiniauto_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clear token and redirect to login if 401
      // localStorage.removeItem('opiniauto_token');
      // window.location.href = '/login'; 
      // Better to handle this in AuthContext or components to avoid full reload loops
    }
    return Promise.reject(error);
  }
);

export default api;
