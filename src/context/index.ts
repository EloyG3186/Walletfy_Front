import { ThemeType } from '@customTypes/context';
import { AuthState } from '../types/auth';
import React from 'react';

const INITIAL_THEME: ThemeType = {
  schema: 'light',
  toggleSchema: () => {
    throw new Error('toggleSchema not implemented');
  },
};

const INITIAL_AUTH: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

export const INITIAL_STATE = {
  ...INITIAL_THEME,
  ...INITIAL_AUTH
};

export type MyContextType = ThemeType & AuthState;

const MyContext = React.createContext<MyContextType>(INITIAL_STATE);

export default MyContext;
