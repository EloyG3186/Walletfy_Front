export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  initialMoney: number;
  profilePicture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  initialMoney?: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  initialMoney?: number;
  profilePicture?: string;
}
