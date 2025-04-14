import React, { useEffect, useState } from 'react';
import { API_URL } from '@config/api';

// Componente de prueba para mostrar datos directamente desde la API
const TestComponent: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Función para obtener datos directamente desde la API
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/events`);
        const data = await response.json();
        
        console.log('Datos crudos de la API:', data);
        
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          setError('Formato de datos inesperado');
        }
      } catch (err) {
        console.error('Error al obtener eventos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Función para agrupar eventos por mes
  const groupEventsByMonth = (events: any[]) => {
    const groupedEvents: Record<string, any[]> = {};
    
    events.forEach(event => {
      // Convertir timestamp a fecha
      const date = new Date(event.date * 1000);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groupedEvents[monthYear]) {
        groupedEvents[monthYear] = [];
      }
      
      groupedEvents[monthYear].push(event);
    });
    
    return Object.entries(groupedEvents).map(([month, monthEvents]) => ({
      month,
      events: monthEvents,
      income: monthEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
      expense: monthEvents.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    }));
  };

  if (loading) {
    return <div className="cd-p-4">Cargando datos...</div>;
  }

  if (error) {
    return <div className="cd-p-4 cd-text-red-500">Error: {error}</div>;
  }

  const groupedEvents = groupEventsByMonth(events);

  return (
    <div className="cd-w-full">
      <div className="cd-mb-6 cd-bg-gray-100 dark:cd-bg-gray-800 cd-p-4 cd-rounded-lg cd-text-left">
        <h3 className="cd-text-lg cd-font-semibold cd-mb-2">Resumen de datos:</h3>
        <p>Número total de eventos: <span className="cd-font-medium">{events.length}</span></p>
        <p>Número de meses: <span className="cd-font-medium">{groupedEvents.length}</span></p>
      </div>
      
      <div className="cd-grid cd-grid-cols-1 md:cd-grid-cols-2 lg:cd-grid-cols-4 cd-gap-4">
        {groupedEvents.map(group => (
          <div key={group.month} className="cd-bg-gray-100 cd-rounded-xl cd-px-4 cd-py-2 cd-flex cd-flex-col dark:cd-bg-zinc-700 dark:cd-border dark:cd-border-gray-600 cd-shadow-2xl">
            <section className="cd-flex cd-justify-between cd-items-center cd-px-2 cd-py-2">
              <h3 className="cd-text-xl cd-font-semibold cd-py-2">{group.month}</h3>
            </section>
            
            <div className="cd-border-b cd-border-gray-200 dark:cd-border-zinc-500"></div>
            
            <section>
              {group.events.map((event: any) => (
                <div key={event._id} className="cd-p-2 cd-rounded hover:cd-bg-slate-400 cd-transition-colors">
                  <a href={`/events/form/${event._id}`}>
                    <div className="cd-flex cd-justify-between cd-items-center">
                      <div className="cd-flex cd-flex-col cd-font-sans cd-text-sm">
                        <span className="cd-text-gray-700 dark:cd-text-gray-200">{event.name}</span>
                        <span className="cd-pb-4 cd-text-gray-700 dark:cd-text-gray-200">
                          {new Date(event.date * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="cd-text-right cd-flex cd-items-center">
                        <p className={`${event.type === 'income' ? 'cd-text-green-600' : 'cd-text-red-300'} cd-text-sm cd-text-right`}>
                          ${event.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="cd-border-b cd-border-gray-200 cd-w-full cd-h-[1px] cd-mb-[0.5rem] dark:cd-border-zinc-500"></div>
                  </a>
                </div>
              ))}
            </section>
            
            <footer className="cd-flex cd-flex-col cd-gap-y-[0.1rem] cd-pb-2">
              <div className="cd-px-2 cd-pb-[1rem]">
                <div className="cd-flex cd-text-sm cd-flex-row cd-justify-between">
                  <strong>Income: </strong>
                  <p>${group.income.toFixed(2)}</p>
                </div>
                <div className="cd-flex cd-text-sm cd-flex-row cd-justify-between">
                  <strong>Expenses: </strong>
                  <p>${group.expense.toFixed(2)}</p>
                </div>
                <div className="cd-flex cd-text-sm cd-flex-row cd-justify-between">
                  <strong>Balance: </strong>
                  <p>${(group.income - group.expense).toFixed(2)}</p>
                </div>
              </div>
            </footer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestComponent;
