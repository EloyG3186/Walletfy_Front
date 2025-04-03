import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css'

import Home from '@pages/home/index.tsx';
import Layout from '@components/Layout.tsx';
import EventForm from '@pages/events/form.tsx';
import MyContext, { INITIAL_STATE, MyContextType } from '@context/index';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

//Crear el BrowserRouter
const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'events/form/:id?',
        element: <EventForm />,
      },
    ],
  }
]);

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [state, setState] = React.useState<MyContextType>(INITIAL_STATE);

  React.useEffect(() => {

    const schema = localStorage.getItem('schema') as 'light' | 'dark' | null;

    if (schema) {
      setSchema(schema);
    }
  }, []);

  return (
    <MyContext.Provider
      value={{
        ...state,
        toggleSchema: () =>
          setSchema(state.schema === 'light' ? 'dark' : 'light'),
      }}
    >
      {/* Añadir el RouterProvider con el router */}
      <RouterProvider router={router} />
    </MyContext.Provider>
  );

  function setSchema(newSchema: 'light' | 'dark') {
    setState((prev) => ({
      ...prev,
      schema: newSchema,
    }));

    localStorage.setItem('schema', newSchema);

    if (newSchema === 'light') {
      document.body.classList.remove('cd-dark');
    } else {
      document.body.classList.add('cd-dark');
    }
  }

}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
