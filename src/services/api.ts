import axios from 'axios';
import { toast } from 'react-toastify';
import { params } from '../types';

// Changed to HTTP since the backend might not be configured for HTTPS
const BASE_URL = 'https://api.simcoehomesolutions.com/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);

    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject(error);
    }

    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      toast.error(message);

      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  sendOtp: async (phoneNumber: string) => {
    const response = await api.post('/auth/otp/send', {
      otpMethod: 'SMS',
      phoneNumber,
    });
    return response.data;
  },
  verifyOtp: async (phoneNumber: string, otp: string) => {
    const response = await api.post('/auth/otp/verify', { phoneNumber, otp });
    return response.data;
  },
  resetPassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

export const userAPI = {
  create: async (userData: any) => {
    const response = await api.post('/user', userData);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },
  list: async (params: params) => {
    const response = await api.get(`/user?page=${params.page}&limit=${params.limit}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },
};

export const quoteAPI = {
  calculate: async (services: any) => {
    const response = await api.post('/quote/calculate', { services: services });
    return response.data;
  },
  create: async (quoteData: any) => {
    const response = await api.post('/quote/create', quoteData);
    return response.data;
  },

  createStatus: async (statusData: any) => {
    const response = await api.post('/quote/status', statusData);
    return response.data;
  },

  getQuotes: async (params: params) => {
    const response = await api.get(
      `/quote/list?page=${params.page}&limit=${params.limit}&text=${params.search ?? ''}&userId=${
        params?.userId ??
        (() => {
          const userStr = localStorage.getItem('user');
          try {
            return userStr ? JSON.parse(userStr).id : undefined;
          } catch {
            return undefined;
          }
        })()
      }`
    );
    return response.data;
  },
  getQuote: async (id: string) => {
    const response = await api.get(`/quote/${id}`);
    return response.data;
  },
  updateQuote: async (id: string, quoteData: any) => {
    const response = await api.put(`/quote/update/${id}`, quoteData);
    return response.data;
  },
  deleteQuote: async (id: string) => {
    const response = await api.delete(`/quote/${id}`);
    return response.data;
  },
};

export default api;
