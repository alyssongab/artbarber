// User types

export interface User {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: 'CLIENT' | 'BARBER' | 'ADMIN'
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    role: 'CLIENT' | 'BARBER';
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Appointment types

export interface Appointment {
    appointment_id: number;
    appointment_date: string;
    appointment_time: string;
    id_barber: number;
    id_client?: number;
    id_service: number;
    appointment_status: 'PENDENTE' | 'CANCELADO' | 'CONCLUIDO';
    notification_sent: boolean;
}

export interface CreateAppointmentRequest {
    appointment_date: string;
    appointment_time: string;
    id_barber: number;
    id_client?: number;
    id_service: number;
}

// Service types

export interface Service {
    service_id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
}

// API Response types

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}