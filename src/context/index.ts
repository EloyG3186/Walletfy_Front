import { ThemeType } from '@customTypes/context';
import React from 'react';

const INITIAL_THEME: ThemeType = {
  schema: 'light',
  toggleSchema: () => {
    throw new Error('toggleSchema not implemented');
  },
};

export const INITIAL_STATE = {
  ...INITIAL_THEME,
};

export type MyContextType = ThemeType;

const MyContext = React.createContext<MyContextType>(INITIAL_STATE);

export default MyContext;
