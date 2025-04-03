/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    './index.html','./src/**/*.{js,ts,jsx,tsx}'  
  ],
  //Usar prefijos en las clases puedes ser util para evitar
  prefix:'cd-',
  theme: {
    extend: {},
  },
  plugins: [],
};