import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, state, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);
  
  // Limpiar errores al desmontar el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="cd-min-h-screen cd-flex cd-items-center cd-justify-center cd-py-12 cd-px-4 sm:cd-px-6 lg:cd-px-8 dark:cd-bg-zinc-800 cd-bg-gray-50">
      <div className="cd-max-w-md cd-w-full cd-space-y-8">
        <div>
          <h2 className="cd-mt-6 cd-text-center cd-text-3xl cd-font-extrabold dark:cd-text-white cd-text-gray-900">
            Iniciar sesión en Walletfy
          </h2>
          <p className="cd-mt-2 cd-text-center cd-text-sm dark:cd-text-gray-300 cd-text-gray-600">
            O{' '}
            <Link to="/register" className="cd-font-medium cd-text-indigo-500 hover:cd-text-indigo-400">
              regístrate si aún no tienes una cuenta
            </Link>
          </p>
        </div>
        
        {state.error && (
          <div className="cd-bg-red-100 dark:cd-bg-red-900 cd-border cd-border-red-400 dark:cd-border-red-600 cd-text-red-700 dark:cd-text-red-200 cd-px-4 cd-py-3 cd-rounded cd-relative" role="alert">
            <span className="cd-block sm:cd-inline">{state.error}</span>
          </div>
        )}
        
        <form className="cd-mt-8 cd-space-y-6" onSubmit={handleSubmit}>
          <div className="cd-rounded-md cd-shadow-sm cd--space-y-px">
            <div>
              <label htmlFor="email" className="cd-sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="cd-appearance-none cd-rounded-none cd-relative cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-500 cd-text-gray-900 cd-rounded-t-md cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 cd-focus:z-10 sm:cd-text-sm"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="cd-sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="cd-appearance-none cd-rounded-none cd-relative cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-500 cd-text-gray-900 cd-rounded-b-md cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 cd-focus:z-10 sm:cd-text-sm"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={state.loading}
              className="cd-group cd-relative cd-w-full cd-flex cd-justify-center cd-py-2 cd-px-4 cd-border cd-border-transparent cd-text-sm cd-font-medium cd-rounded-md cd-text-white cd-bg-indigo-600 hover:cd-bg-indigo-700 cd-focus:outline-none cd-focus:ring-2 cd-focus:ring-offset-2 cd-focus:ring-indigo-500"
            >
              {state.loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        <div className="cd-mt-6">
          <div className="cd-relative">
            <div className="cd-absolute cd-inset-0 cd-flex cd-items-center">
              <div className="cd-w-full cd-border-t dark:cd-border-gray-600 cd-border-gray-300"></div>
            </div>
            <div className="cd-relative cd-flex cd-justify-center cd-text-sm">
              <span className="cd-px-2 dark:cd-bg-zinc-800 cd-bg-gray-50 dark:cd-text-gray-300 cd-text-gray-500">O continúa con</span>
            </div>
          </div>

          <div className="cd-mt-6 cd-grid cd-grid-cols-2 cd-gap-3">
            <a
              href={`${import.meta.env.VITE_API_URL}/api/users/auth/google`}
              className="cd-w-full cd-inline-flex cd-justify-center cd-py-2 cd-px-4 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 cd-bg-white cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-500 hover:cd-bg-gray-50 dark:hover:cd-bg-gray-600"
            >
              <FaGoogle className="cd-h-5 cd-w-5 cd-text-red-500" />
              <span className="cd-ml-2">Google</span>
            </a>

            <a
              href={`${import.meta.env.VITE_API_URL}/api/users/auth/facebook`}
              className="cd-w-full cd-inline-flex cd-justify-center cd-py-2 cd-px-4 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 cd-bg-white cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-500 hover:cd-bg-gray-50 dark:hover:cd-bg-gray-600"
            >
              <FaFacebook className="cd-h-5 cd-w-5 cd-text-blue-600" />
              <span className="cd-ml-2">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
