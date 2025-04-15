import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    initialMoney: 0
  });
  const { register, state, clearError } = useAuth();
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
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos requeridos estén completos
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert(`Por favor complete los siguientes campos: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }
    
    // Validar que el teléfono tenga al menos 7 caracteres
    if (formData.phone.length < 7) {
      alert('El teléfono debe tener al menos 7 caracteres');
      return;
    }
    
    // Asegurarse de que initialMoney sea un número
    const formDataToSend = {
      ...formData,
      initialMoney: typeof formData.initialMoney === 'string' ? 
        parseFloat(formData.initialMoney) : formData.initialMoney
    };
    
    console.log('Enviando datos de registro:', formDataToSend);
    await register(formDataToSend);
  };

  return (
    <div className="cd-min-h-screen cd-flex cd-items-center cd-justify-center cd-py-12 cd-px-4 sm:cd-px-6 lg:cd-px-8 dark:cd-bg-zinc-800 cd-bg-gray-50">
      <div className="cd-max-w-md cd-w-full cd-space-y-8">
        <div>
          <h2 className="cd-mt-6 cd-text-center cd-text-3xl cd-font-extrabold dark:cd-text-white cd-text-gray-900">
            Crear una cuenta en Walletfy
          </h2>
          <p className="cd-mt-2 cd-text-center cd-text-sm dark:cd-text-gray-300 cd-text-gray-600">
            O{' '}
            <Link to="/login" className="cd-font-medium cd-text-indigo-500 hover:cd-text-indigo-400">
              inicia sesión si ya tienes una cuenta
            </Link>
          </p>
        </div>
        
        {state.error && (
          <div className="cd-bg-red-100 dark:cd-bg-red-900 cd-border cd-border-red-400 dark:cd-border-red-600 cd-text-red-700 dark:cd-text-red-200 cd-px-4 cd-py-3 cd-rounded cd-relative" role="alert">
            <span className="cd-block sm:cd-inline">{state.error}</span>
          </div>
        )}
        
        <form className="cd-mt-8 cd-space-y-6" onSubmit={handleSubmit}>
          <div className="cd-space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="firstName" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="initialMoney" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                Dinero Inicial
              </label>
              <input
                id="initialMoney"
                name="initialMoney"
                type="number"
                step="0.01"
                className="cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md cd-shadow-sm dark:cd-bg-gray-700 dark:cd-text-white dark:cd-placeholder-gray-400 cd-placeholder-gray-400 cd-focus:outline-none cd-focus:ring-indigo-500 cd-focus:border-indigo-500 sm:cd-text-sm"
                value={formData.initialMoney}
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
              {state.loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
