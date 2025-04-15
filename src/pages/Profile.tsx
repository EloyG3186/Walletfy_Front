import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { state, updateUser, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    initialMoney: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!state.isAuthenticated && !state.loading) {
      navigate('/login');
    }
  }, [state.isAuthenticated, state.loading, navigate]);
  
  // Limpiar errores al desmontar el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Cargar datos del usuario
  useEffect(() => {
    if (state.user) {
      setFormData({
        firstName: state.user.firstName,
        lastName: state.user.lastName,
        phone: state.user.phone,
        initialMoney: state.user.initialMoney
      });
    }
  }, [state.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(formData);
    setIsEditing(false);
  };

  if (state.loading || !state.user) {
    return (
      <div className="cd-min-h-screen cd-flex cd-items-center cd-justify-center dark:cd-bg-zinc-800 cd-bg-gray-50">
        <div className="cd-text-center">
          <p className="cd-text-lg dark:cd-text-gray-300 cd-text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-min-h-screen dark:cd-bg-zinc-800 cd-bg-gray-50 cd-py-12 cd-px-4 sm:cd-px-6 lg:cd-px-8">
      <div className="cd-max-w-3xl cd-mx-auto">
        <div className="dark:cd-bg-gray-700 cd-bg-white cd-shadow cd-overflow-hidden sm:cd-rounded-lg">
          <div className="cd-px-4 cd-py-5 sm:cd-px-6 cd-flex cd-justify-between cd-items-center">
            <div>
              <h3 className="cd-text-lg cd-leading-6 cd-font-medium dark:cd-text-white cd-text-gray-900">Perfil de Usuario</h3>
              <p className="cd-mt-1 cd-max-w-2xl cd-text-sm dark:cd-text-gray-300 cd-text-gray-500">Información personal y configuración</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="cd-inline-flex cd-items-center cd-px-4 cd-py-2 cd-border cd-border-transparent cd-text-sm cd-font-medium cd-rounded-md cd-text-white cd-bg-indigo-600 hover:cd-bg-indigo-700 cd-focus:outline-none cd-focus:ring-2 cd-focus:ring-offset-2 cd-focus:ring-indigo-500"
              >
                Editar Perfil
              </button>
            )}
          </div>
          
          {state.error && (
            <div className="cd-bg-red-100 dark:cd-bg-red-900 cd-border cd-border-red-400 dark:cd-border-red-600 cd-text-red-700 dark:cd-text-red-200 cd-px-4 cd-py-3 cd-rounded cd-relative" role="alert">
              <span className="cd-block sm:cd-inline">{state.error}</span>
            </div>
          )}

          {isEditing ? (
            <div className="cd-border-t dark:cd-border-gray-600 cd-border-gray-200 cd-px-4 cd-py-5 sm:cd-p-6">
              <form onSubmit={handleSubmit}>
                <div className="cd-grid cd-grid-cols-6 cd-gap-6">
                  <div className="cd-col-span-6 sm:cd-col-span-3">
                    <label htmlFor="firstName" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="cd-mt-1 cd-focus:ring-indigo-500 cd-focus:border-indigo-500 cd-block cd-w-full cd-shadow-sm sm:cd-text-sm dark:cd-border-gray-600 cd-border-gray-300 dark:cd-bg-gray-700 dark:cd-text-white cd-rounded-md"
                    />
                  </div>

                  <div className="cd-col-span-6 sm:cd-col-span-3">
                    <label htmlFor="lastName" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="cd-mt-1 cd-focus:ring-indigo-500 cd-focus:border-indigo-500 cd-block cd-w-full cd-shadow-sm sm:cd-text-sm dark:cd-border-gray-600 cd-border-gray-300 dark:cd-bg-gray-700 dark:cd-text-white cd-rounded-md"
                    />
                  </div>

                  <div className="cd-col-span-6 sm:cd-col-span-3">
                    <label htmlFor="email" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={state.user.email}
                      disabled
                      className="cd-mt-1 cd-block cd-w-full cd-shadow-sm sm:cd-text-sm dark:cd-border-gray-600 cd-border-gray-300 cd-rounded-md dark:cd-bg-gray-600 cd-bg-gray-100 dark:cd-text-gray-400"
                    />
                    <p className="cd-mt-1 cd-text-xs dark:cd-text-gray-400 cd-text-gray-500">El correo electrónico no se puede modificar</p>
                  </div>

                  <div className="cd-col-span-6 sm:cd-col-span-3">
                    <label htmlFor="phone" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="cd-mt-1 cd-focus:ring-indigo-500 cd-focus:border-indigo-500 cd-block cd-w-full cd-shadow-sm sm:cd-text-sm dark:cd-border-gray-600 cd-border-gray-300 dark:cd-bg-gray-700 dark:cd-text-white cd-rounded-md"
                    />
                  </div>

                  <div className="cd-col-span-6 sm:cd-col-span-3">
                    <label htmlFor="initialMoney" className="cd-block cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-700">
                      Dinero Inicial
                    </label>
                    <input
                      type="number"
                      name="initialMoney"
                      id="initialMoney"
                      step="0.01"
                      value={formData.initialMoney}
                      onChange={handleChange}
                      className="cd-mt-1 cd-focus:ring-indigo-500 cd-focus:border-indigo-500 cd-block cd-w-full cd-shadow-sm sm:cd-text-sm dark:cd-border-gray-600 cd-border-gray-300 dark:cd-bg-gray-700 dark:cd-text-white cd-rounded-md"
                    />
                  </div>
                </div>

                <div className="cd-mt-6 cd-flex cd-justify-end cd-space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="cd-inline-flex cd-justify-center cd-py-2 cd-px-4 cd-border dark:cd-border-gray-600 cd-border-gray-300 cd-shadow-sm cd-text-sm cd-font-medium cd-rounded-md dark:cd-text-gray-300 cd-text-gray-700 dark:cd-bg-gray-700 cd-bg-white dark:hover:cd-bg-gray-600 hover:cd-bg-gray-50 cd-focus:outline-none cd-focus:ring-2 cd-focus:ring-offset-2 cd-focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="cd-inline-flex cd-justify-center cd-py-2 cd-px-4 cd-border cd-border-transparent cd-shadow-sm cd-text-sm cd-font-medium cd-rounded-md cd-text-white cd-bg-indigo-600 hover:cd-bg-indigo-700 cd-focus:outline-none cd-focus:ring-2 cd-focus:ring-offset-2 cd-focus:ring-indigo-500"
                  >
                    {state.loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="cd-border-t dark:cd-border-gray-600 cd-border-gray-200">
              <dl>
                <div className="dark:cd-bg-gray-800 cd-bg-gray-50 cd-px-4 cd-py-5 sm:cd-grid sm:cd-grid-cols-3 sm:cd-gap-4 sm:cd-px-6">
                  <dt className="cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-500">Nombre completo</dt>
                  <dd className="cd-mt-1 cd-text-sm dark:cd-text-gray-200 cd-text-gray-900 sm:cd-mt-0 sm:cd-col-span-2">
                    {state.user.firstName} {state.user.lastName}
                  </dd>
                </div>
                <div className="dark:cd-bg-gray-700 cd-bg-white cd-px-4 cd-py-5 sm:cd-grid sm:cd-grid-cols-3 sm:cd-gap-4 sm:cd-px-6">
                  <dt className="cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-500">Correo electrónico</dt>
                  <dd className="cd-mt-1 cd-text-sm dark:cd-text-gray-200 cd-text-gray-900 sm:cd-mt-0 sm:cd-col-span-2">{state.user.email}</dd>
                </div>
                <div className="dark:cd-bg-gray-800 cd-bg-gray-50 cd-px-4 cd-py-5 sm:cd-grid sm:cd-grid-cols-3 sm:cd-gap-4 sm:cd-px-6">
                  <dt className="cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-500">Teléfono</dt>
                  <dd className="cd-mt-1 cd-text-sm dark:cd-text-gray-200 cd-text-gray-900 sm:cd-mt-0 sm:cd-col-span-2">{state.user.phone}</dd>
                </div>
                <div className="dark:cd-bg-gray-700 cd-bg-white cd-px-4 cd-py-5 sm:cd-grid sm:cd-grid-cols-3 sm:cd-gap-4 sm:cd-px-6">
                  <dt className="cd-text-sm cd-font-medium dark:cd-text-gray-300 cd-text-gray-500">Dinero Inicial</dt>
                  <dd className="cd-mt-1 cd-text-sm dark:cd-text-gray-200 cd-text-gray-900 sm:cd-mt-0 sm:cd-col-span-2">
                    ${state.user.initialMoney.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
