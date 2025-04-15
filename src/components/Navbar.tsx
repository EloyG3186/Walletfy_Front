import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

interface NavbarProps {
  toggleSchema: () => void;
  schema: 'light' | 'dark';
}

const Navbar: React.FC<NavbarProps> = ({ toggleSchema, schema }) => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`cd-fixed cd-top-0 cd-left-0 cd-right-0 cd-w-full cd-shadow-md ${schema === 'dark' ? 'cd-bg-zinc-800' : 'cd-bg-indigo-600'} cd-transition-colors cd-duration-500`}>
      <div className="cd-max-w-7xl cd-mx-auto cd-px-4 sm:cd-px-6 lg:cd-px-8">
        <div className="cd-flex cd-items-center cd-justify-between cd-h-16">
          <div className="cd-flex cd-items-center">
            <div className="cd-flex-shrink-0">
              <Link to="/" className="cd-text-white cd-font-bold cd-text-xl">Wallet<span className="cd-text-indigo-300">fy</span></Link>
            </div>
            <div className="cd-hidden md:cd-block">
              <div className="cd-ml-10 cd-flex cd-items-baseline cd-space-x-4">
                <Link to="/" className="cd-text-white hover:cd-bg-indigo-500 cd-px-3 cd-py-2 cd-rounded-md cd-text-sm cd-font-medium">
                  Inicio
                </Link>
              </div>
            </div>
          </div>
          <div className="cd-hidden md:cd-block">
            <div className="cd-ml-4 cd-flex cd-items-center md:cd-ml-6">
              <button
                className={`cd-p-2 sm:cd-p-3 cd-rounded-md cd-shadow-lg ${schema === 'dark' ? 'cd-bg-zinc-700 hover:cd-bg-gray-500' : 'cd-bg-gray-200 hover:cd-bg-gray-300'} cd-mx-2 sm:cd-mx-6 cd-transition-colors cd-duration-500`}
                onClick={toggleSchema}
              >
                {schema === 'light' ? '🌒' : '🌞'}
              </button>
              {state.isAuthenticated ? (
                <div className="cd-relative cd-ml-3">
                  <div>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="cd-max-w-xs cd-rounded-full cd-flex cd-items-center cd-text-sm cd-focus:outline-none cd-focus:ring-2 cd-focus:ring-offset-2 cd-focus:ring-white"
                    >
                      <span className="cd-sr-only">Abrir menú de usuario</span>
                      <div className={`cd-h-8 cd-w-8 cd-rounded-full ${schema === 'dark' ? 'cd-bg-indigo-800' : 'cd-bg-indigo-700'} cd-flex cd-items-center cd-justify-center cd-text-white`}>
                        {state.user?.firstName.charAt(0)}
                        {state.user?.lastName.charAt(0)}
                      </div>
                    </button>
                  </div>
                  {isMenuOpen && (
                    <div className={`cd-origin-top-right cd-absolute cd-right-0 cd-mt-2 cd-w-48 cd-rounded-md cd-shadow-lg cd-py-1 ${schema === 'dark' ? 'cd-bg-zinc-700 cd-text-white' : 'cd-bg-white cd-text-gray-700'} cd-ring-1 cd-ring-black cd-ring-opacity-5 cd-focus:outline-none`}>
                      <div className={`cd-px-4 cd-py-2 cd-text-sm ${schema === 'dark' ? 'cd-text-white' : 'cd-text-gray-700'} cd-border-b`}>
                        <p className="cd-font-medium">{state.user?.firstName} {state.user?.lastName}</p>
                        <p className="cd-text-xs">{state.user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className={`cd-block cd-px-4 cd-py-2 cd-text-sm ${schema === 'dark' ? 'cd-text-white hover:cd-bg-zinc-600' : 'cd-text-gray-700 hover:cd-bg-gray-100'} cd-flex cd-items-center`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUser className="cd-mr-2" /> Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className={`cd-block cd-w-full cd-text-left cd-px-4 cd-py-2 cd-text-sm ${schema === 'dark' ? 'cd-text-white hover:cd-bg-zinc-600' : 'cd-text-gray-700 hover:cd-bg-gray-100'} cd-flex cd-items-center`}
                      >
                        <FaSignOutAlt className="cd-mr-2" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cd-flex cd-space-x-2">
                  <Link
                    to="/login"
                    className="cd-text-white cd-bg-indigo-700 hover:cd-bg-indigo-800 cd-px-3 cd-py-2 cd-rounded-md cd-text-sm cd-font-medium cd-flex cd-items-center"
                  >
                    <FaSignInAlt className="cd-mr-1" /> Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="cd-text-indigo-300 hover:cd-bg-indigo-500 hover:cd-text-white cd-px-3 cd-py-2 cd-rounded-md cd-text-sm cd-font-medium cd-flex cd-items-center"
                  >
                    <FaUserPlus className="cd-mr-1" /> Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="cd--mr-2 cd-flex md:cd-hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${schema === 'dark' ? 'cd-bg-zinc-800' : 'cd-bg-indigo-600'} cd-inline-flex cd-items-center cd-justify-center cd-p-2 cd-rounded-md cd-text-indigo-200 hover:cd-text-white hover:cd-bg-indigo-500 cd-focus:outline-none cd-focus:ring-2 cd-focus:ring-offset-2 cd-focus:ring-white`}
            >
              <span className="cd-sr-only">Abrir menú principal</span>
              <svg
                className={`${isMenuOpen ? 'cd-hidden' : 'cd-block'} cd-h-6 cd-w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'cd-block' : 'cd-hidden'} cd-h-6 cd-w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`${isMenuOpen ? 'cd-block' : 'cd-hidden'} md:cd-hidden`}>
        <div className="cd-px-2 cd-pt-2 cd-pb-3 cd-space-y-1 sm:cd-px-3">
          <Link
            to="/"
            className="cd-text-white hover:cd-bg-indigo-500 cd-block cd-px-3 cd-py-2 cd-rounded-md cd-text-base cd-font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Inicio
          </Link>
        </div>
        <div className="cd-pt-4 cd-pb-3 cd-border-t cd-border-indigo-700">
          {state.isAuthenticated ? (
            <div className="cd-px-2 cd-space-y-1">
              <div className="cd-px-4 cd-py-2 cd-text-sm cd-text-white">
                <p className="cd-font-medium">{state.user?.firstName} {state.user?.lastName}</p>
                <p className="cd-text-xs cd-text-indigo-200">{state.user?.email}</p>
              </div>
              <Link
                to="/profile"
                className="cd-block cd-px-3 cd-py-2 cd-rounded-md cd-text-base cd-font-medium cd-text-white hover:cd-bg-indigo-500 cd-flex cd-items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser className="cd-mr-2" /> Perfil
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="cd-block cd-w-full cd-text-left cd-px-3 cd-py-2 cd-rounded-md cd-text-base cd-font-medium cd-text-white hover:cd-bg-indigo-500 cd-flex cd-items-center"
              >
                <FaSignOutAlt className="cd-mr-2" /> Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="cd-px-2 cd-space-y-1">
              <Link
                to="/login"
                className="cd-block cd-px-3 cd-py-2 cd-rounded-md cd-text-base cd-font-medium cd-text-white hover:cd-bg-indigo-500 cd-flex cd-items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaSignInAlt className="cd-mr-2" /> Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="cd-block cd-px-3 cd-py-2 cd-rounded-md cd-text-base cd-font-medium cd-text-white hover:cd-bg-indigo-500 cd-flex cd-items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserPlus className="cd-mr-2" /> Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
