import axios from 'axios';
import { User, LoginRequest, RegisterClientRequest, AuthResponse, GetAvailabilityInput, CreateAppointmentRequest, RelatedAppointmentsResponse, ServiceResponseDTO, UserResponseDTO, AppointmentResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle with responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401 && url !== '/users/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  refreshToken: async() => {
      const response = await api.post("/users/refresh-token");
      const { accessToken, user } = response.data;

      // refreshes token on localstorage
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      return { accessToken, user };
  },

  // Backend returns created user DTO (no token)
  register: async (data: RegisterClientRequest): Promise<{
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string;
    birthday?: string | null;
    role: 'CLIENT' | 'BARBER' | 'ADMIN';
    photo_url?: string | null;
  }> => {
    const response = await api.post('/users/client', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!(token && token !== 'undefined' && token !== 'null');
  },
};

export const appointmentService = {

  getServices: async (): Promise<ServiceResponseDTO> => {
      const response = await api.get<ServiceResponseDTO>("/services");
      return response.data;
  },

  getBarbers: async (): Promise<UserResponseDTO> => {
      const response = await api.get<UserResponseDTO>("/users/barbers");
      return response.data;
  },

  getAvailableHours: async (input: GetAvailabilityInput): Promise<string[]> => {
      const response = await api.post<string[]>("/appointments/availability", input);
      return response.data;
  },

  createAppointment: async (data: CreateAppointmentRequest): Promise<AppointmentResponse> => {
    const response = await api.post<AppointmentResponse>("/appointments", data);
    return response.data;
  },

  getRelatedAppointments: async(page = 1, limit = 10): Promise<RelatedAppointmentsResponse> => {
    const params = new URLSearchParams({
      _page: String(page),
      _limit: String(limit),
    });

    const myAppointments = await api.get<RelatedAppointmentsResponse>(`/appointments?${params.toString()}`);
    return myAppointments.data;
  }

}