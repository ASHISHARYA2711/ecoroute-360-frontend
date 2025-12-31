import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecoroute360-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export default api;
