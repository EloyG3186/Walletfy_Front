import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { state } = useAuth();

  // Si está cargando, mostrar un indicador de carga
  if (state.loading) {
    return (
      <div className="cd-min-h-screen cd-flex cd-items-center cd-justify-center dark:cd-bg-zinc-800 cd-bg-gray-50">
        <div className="cd-text-center">
          <p className="cd-text-lg dark:cd-text-gray-300 cd-text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a la página de inicio de sesión
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <Outlet />;
};

export default ProtectedRoute;
