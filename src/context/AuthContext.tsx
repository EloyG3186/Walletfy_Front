import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AuthState, LoginCredentials, RegisterData, UpdateUserData, User } from '../types/auth';
import axios from 'axios';

// Estado inicial de autenticación
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

// Tipos de acciones
type AuthAction =
  | { type: 'LOGIN_REQUEST' | 'REGISTER_REQUEST' | 'UPDATE_USER_REQUEST' }
  | { type: 'LOGIN_SUCCESS' | 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'UPDATE_USER_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_ERROR' | 'LOGIN_FAIL' | 'REGISTER_FAIL' | 'UPDATE_USER_FAIL'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOAD_USER_SUCCESS'; payload: User }
  | { type: 'AUTH_INIT_COMPLETE' };

// Reducer para manejar las acciones de autenticación
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
    case 'UPDATE_USER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null
      };
    case 'LOAD_USER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'UPDATE_USER_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...initialState,
        token: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'AUTH_INIT_COMPLETE':
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
};

// Crear el contexto de autenticación
interface AuthContextProps {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateUserData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configurar el token en los headers de axios
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Cargar usuario al iniciar si hay token
  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      if (!state.isAuthenticated && state.token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`);
          if (isMounted) {
            dispatch({ type: 'LOAD_USER_SUCCESS', payload: res.data.user });
          }
        } catch (error) {
          if (isMounted) {
            dispatch({ type: 'AUTH_ERROR', payload: 'Sesión expirada, por favor inicie sesión nuevamente' });
            localStorage.removeItem('token');
          }
        }
      }
      if (isMounted) {
        dispatch({ type: 'AUTH_INIT_COMPLETE' });
      }
    };

    loadUser();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [state.token, state.isAuthenticated]);

  // Iniciar sesión
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user, token: res.data.token }
      });
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error.response?.data?.message || 'Error al iniciar sesión'
      });
    }
  };

  // Registrar usuario
  const register = async (data: RegisterData) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      console.log('Enviando datos de registro:', JSON.stringify(data, null, 2));
      console.log('URL de la API:', import.meta.env.VITE_API_URL);
      
      // Asegurarse de que los datos están completos
      if (!data.email || !data.password || !data.firstName || !data.lastName || !data.phone) {
        console.error('Datos de registro incompletos:', data);
        dispatch({
          type: 'REGISTER_FAIL',
          payload: 'Todos los campos son obligatorios'
        });
        return;
      }
      
      // Convertir initialMoney a número si es string
      const formattedData = {
        ...data,
        initialMoney: typeof data.initialMoney === 'string' ? parseFloat(data.initialMoney) : data.initialMoney
      };
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, formattedData);
      console.log('Respuesta del servidor:', res.data);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user: res.data.user, token: res.data.token }
      });
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      console.error('Detalles del error:', error.response?.data);
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: error.response?.data?.message || 'Error al registrar usuario'
      });
    }
  };

  // Actualizar perfil de usuario
  const updateUser = async (data: UpdateUserData) => {
    dispatch({ type: 'UPDATE_USER_REQUEST' });
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, data);
      dispatch({
        type: 'UPDATE_USER_SUCCESS',
        payload: { user: res.data.user }
      });
    } catch (error: any) {
      dispatch({
        type: 'UPDATE_USER_FAIL',
        payload: error.response?.data?.message || 'Error al actualizar perfil'
      });
    }
  };

  // Cerrar sesión
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Limpiar errores
  const clearError = React.useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
