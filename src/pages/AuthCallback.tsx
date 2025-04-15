import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processAuth = async () => {
      // Obtener el token de la URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const errorMsg = params.get('message');

      if (token) {
        // Guardar el token en localStorage
        localStorage.setItem('token', token);
        
        // Configurar axios con el nuevo token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Actualizar estado
        setProcessingStatus('success');
        
        // Redirigir a la página principal después de un breve retraso
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (location.pathname.includes('/error')) {
        // Error en la autenticación
        setProcessingStatus('error');
        setErrorMessage(errorMsg || 'Error en la autenticación con el proveedor externo');
        
        // Redirigir a login después de mostrar el error
        setTimeout(() => {
          navigate('/login', { 
            state: { error: errorMsg || 'Error en la autenticación con el proveedor externo' } 
          });
        }, 3000);
      } else {
        // Redirigir a login si no hay token
        navigate('/login');
      }
    };

    // Si no está autenticado, procesar la autenticación
    if (!state.isAuthenticated) {
      processAuth();
    } else {
      // Si ya está autenticado, redirigir a la página principal
      navigate('/');
    }
  }, [location, navigate, state.isAuthenticated]);

  return (
    <div className="cd-min-h-screen cd-flex cd-items-center cd-justify-center dark:cd-bg-zinc-800 cd-bg-gray-50">
      <div className="cd-text-center cd-max-w-md cd-p-6 dark:cd-bg-gray-700 cd-bg-white cd-rounded-lg cd-shadow-md">
        {processingStatus === 'processing' && (
          <>
            <div className="cd-flex cd-justify-center cd-mb-4">
              <div className="cd-animate-spin cd-rounded-full cd-h-12 cd-w-12 cd-border-t-2 cd-border-b-2 cd-border-indigo-500"></div>
            </div>
            <h2 className="cd-text-xl cd-font-semibold dark:cd-text-gray-200 cd-text-gray-700">Procesando autenticación...</h2>
            <p className="cd-mt-2 dark:cd-text-gray-300 cd-text-gray-500">Por favor espere mientras lo redirigimos.</p>
          </>
        )}
        
        {processingStatus === 'success' && (
          <>
            <div className="cd-flex cd-justify-center cd-mb-4 cd-text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="cd-h-12 cd-w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="cd-text-xl cd-font-semibold dark:cd-text-gray-200 cd-text-gray-700">¡Autenticación exitosa!</h2>
            <p className="cd-mt-2 dark:cd-text-gray-300 cd-text-gray-500">Redirigiendo a la página principal...</p>
          </>
        )}
        
        {processingStatus === 'error' && (
          <>
            <div className="cd-flex cd-justify-center cd-mb-4 cd-text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="cd-h-12 cd-w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="cd-text-xl cd-font-semibold dark:cd-text-gray-200 cd-text-gray-700">Error de autenticación</h2>
            <p className="cd-mt-2 dark:cd-text-gray-300 cd-text-gray-500">{errorMessage}</p>
            <p className="cd-mt-2 dark:cd-text-gray-300 cd-text-gray-500">Redirigiendo a la página de inicio de sesión...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
