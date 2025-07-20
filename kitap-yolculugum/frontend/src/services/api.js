import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axios instance oluştur
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Token ekle
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

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Bir hata oluştu';
    
    // 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın');
      return Promise.reject(error);
    }

    // 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmuyor');
      return Promise.reject(error);
    }

    // 404 - Not Found
    if (error.response?.status === 404) {
      toast.error('Aranan sayfa veya kaynak bulunamadı');
      return Promise.reject(error);
    }

    // 500 - Server Error
    if (error.response?.status >= 500) {
      toast.error('Sunucu hatası, lütfen daha sonra tekrar deneyin');
      return Promise.reject(error);
    }

    // Diğer hatalar
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;