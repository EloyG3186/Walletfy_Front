import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import { QKeys } from '@constants/query';
import DataRepo from '@api/datasource';
import { EventLoaderDataType, EventType, FlowType } from '@customTypes/event';

interface DirectFlowViewProps {
  initialMoney?: number;
}

const DirectFlowView = ({ initialMoney = 0 }: DirectFlowViewProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [groupedEvents, setGroupedEvents] = useState<Record<string, FlowType>>({});
  const [internalInitialMoney, setInternalInitialMoney] = useState(initialMoney);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmMode, setIsDeleteConfirmMode] = useState(false);
  
  // Función para navegar al formulario de edición
  const handleEditEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation(); // Evitar que se abra la modal
    navigate(`/events/form/${eventId}`);
  };
  
  // Función para abrir la modal con los detalles del evento
  const openEventDetails = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  // Función para cerrar la modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Función para activar el modo de confirmación de eliminación dentro del modal existente
  const activateDeleteConfirmMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirmMode(true);
  };

  // Función para cancelar el modo de confirmación de eliminación
  const cancelDeleteConfirmMode = () => {
    setIsDeleteConfirmMode(false);
  };
  
  // Actualizar el estado interno cuando cambia la prop
  useEffect(() => {
    setInternalInitialMoney(initialMoney);
  }, [initialMoney]);

  // Mutación para eliminar un evento
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => {
      return DataRepo.deleteEvent(eventId);
    },
    onSuccess: () => {
      // Actualizar la caché de los eventos después de eliminar uno
      queryClient.invalidateQueries({ queryKey: [QKeys.GET_EVENTS] });
      closeModal();
      setIsDeleteConfirmMode(false);
    },
    onError: (error: Error) => {
      console.error('Error al eliminar el evento:', error);
      setError(`Error al eliminar el evento: ${error.message}`);
      setIsDeleteConfirmMode(false);
    }
  });

  // Función para eliminar el evento
  const handleDeleteEvent = () => {
    if (selectedEvent && (selectedEvent._id || selectedEvent.id)) {
      deleteEventMutation.mutate(selectedEvent._id || selectedEvent.id);
    } else {
      console.error('No se pudo eliminar el evento: ID no encontrado');
      setError('No se pudo eliminar el evento: ID no encontrado');
      setIsDeleteConfirmMode(false);
    }
  };

  // Usar useQuery para obtener los eventos
  const { data: eventData, isLoading: queryLoading, error: queryError, refetch } = useQuery<
    EventLoaderDataType,
    Error,
    EventLoaderDataType,
    [string]
  >({
    queryKey: [QKeys.GET_EVENTS],
    queryFn: () => {
      return DataRepo.loadEvents();
    },
    // Refrescar datos cada 30 segundos
    refetchInterval: 30000,
  });

  useEffect(() => {
    setLoading(queryLoading);
    
    if (queryError) {
      console.error('DirectFlowView - Error al cargar eventos:', queryError);
      setError(queryError.message || 'Error al cargar los eventos');
    } else {
      setError(null);
    }
    
    if (eventData && eventData.events) {
      console.log('DirectFlowView - Eventos recibidos:', eventData.events.length);
      
      // Procesar eventos solo si hay datos disponibles
      if (Array.isArray(eventData.events) && eventData.events.length > 0) {
        const grouped = processEvents(eventData.events, internalInitialMoney);
        setGroupedEvents(grouped);
      } else {
        console.warn('DirectFlowView - No hay eventos disponibles en la API');
        setGroupedEvents({});
      }
    }
  }, [eventData, queryLoading, queryError, internalInitialMoney]);
  
  /**
   * Procesa los eventos y los agrupa por mes, calculando ingresos, gastos y balances
   * @param events Array de eventos a procesar
   * @param initialMoney Dinero inicial para calcular el balance global
   * @returns Objeto con los eventos agrupados por mes
   */
  const processEvents = (events: EventType[], initialMoney: number): Record<string, FlowType> => {
    // Agrupar eventos por mes
    const grouped: Record<string, FlowType> = {};
    
    events.forEach((event) => {
      if (!event) return;
      
      // Asegurarse de que date sea un número
      let timestamp = 0;
      
      if (typeof event.date === 'number') {
        timestamp = event.date;
      } else if (typeof event.date === 'string') {
        timestamp = parseInt(event.date, 10) || Math.floor(new Date(event.date).getTime() / 1000);
      } else {
        // Si no hay fecha, usar la fecha actual
        timestamp = Math.floor(Date.now() / 1000);
      }
      
      // Guardar el timestamp en el evento para usarlo en la ordenación
      event.timestamp = timestamp;
      
      const date = new Date(timestamp * 1000);
      const monthYear = moment(date).format('YYYY-MM');
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          id: monthYear,
          month: moment(monthYear, 'YYYY-MM').format('MMMM YYYY'),
          events: [],
          income: 0,
          expense: 0,
          monthly: 0,
          global: 0
        };
      }
      
      grouped[monthYear].events.push(event);
      
      // Asegurarse de que amount sea un número
      const amount = typeof event.amount === 'number' ? event.amount : 
                    parseFloat(event.amount) || 0;
      
      // Actualizar ingresos o gastos
      if (event.type === 'income') {
        grouped[monthYear].income += amount;
      } else if (event.type === 'expense') {
        grouped[monthYear].expense += amount;
      }
    });
    
    // Ordenar los eventos por fecha (descendente) dentro de cada mes
    Object.keys(grouped).forEach(month => {
      grouped[month].events.sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return timestampB - timestampA; // Orden descendente por timestamp (más reciente primero)
      });
    });
    
    // Calcular balance mensual y global
    let runningTotal = initialMoney;
    const sortedMonths = Object.keys(grouped).sort();
    
    sortedMonths.forEach(month => {
      grouped[month].monthly = grouped[month].income - grouped[month].expense;
      runningTotal += grouped[month].monthly;
      grouped[month].global = runningTotal;
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="cd-flex cd-justify-center cd-items-center cd-p-8">
        <p className="cd-text-lg">Cargando flujos de eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cd-bg-red-100 cd-border cd-border-red-400 cd-text-red-700 cd-px-4 cd-py-3 cd-rounded cd-mb-4">
        <p className="cd-font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  // Calcular el saldo global actual sumando el dinero inicial y todos los balances mensuales
  const calcularSaldoGlobal = () => {
    if (Object.keys(groupedEvents).length === 0) return internalInitialMoney;
    
    // Obtener el último mes (el más reciente) para obtener el balance global acumulado
    const meses = Object.keys(groupedEvents).sort();
    if (meses.length > 0) {
      const ultimoMes = meses[meses.length - 1];
      return groupedEvents[ultimoMes].global;
    }
    
    return internalInitialMoney;
  };
  
  const saldoGlobal = calcularSaldoGlobal();
  
  return (
    <div className="cd-w-full">
      <div className="cd-mb-6 cd-bg-gray-100 dark:cd-bg-gray-800 cd-p-4 cd-rounded-lg">
        <div className="cd-grid cd-grid-cols-1 md:cd-grid-cols-2 cd-gap-4">
          <div>
            <p className="cd-font-bold cd-text-lg cd-mb-2">Información:</p>
            <p>Número de meses: {Object.keys(groupedEvents).length}</p>
            <p>Dinero inicial: ${internalInitialMoney.toFixed(2)}</p>
            <p className="cd-text-sm cd-text-gray-500">(Valor configurado en la parte superior)</p>
            {/*<p>Meses encontrados: {Object.keys(groupedEvents).join(', ')}</p>*/}
          </div>
          <div className="cd-flex cd-flex-col cd-justify-center cd-items-center cd-border-l cd-border-gray-300 dark:cd-border-gray-700 md:cd-pl-4">
            <p className="cd-text-lg cd-font-semibold cd-mb-2">Saldo global a la fecha:</p>
            <p className={`cd-text-2xl cd-font-bold ${saldoGlobal >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
              ${saldoGlobal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {Object.keys(groupedEvents).length > 0 ? (
        <div className="cd-grid cd-grid-cols-1 md:cd-grid-cols-2 lg:cd-grid-cols-3 cd-gap-6">
          {Object.keys(groupedEvents).sort().reverse().map(month => {
            const monthData = groupedEvents[month];
            return (
              <div key={month} className="cd-bg-white dark:cd-bg-gray-800 cd-rounded-lg cd-shadow-md cd-overflow-hidden">
                <div className="cd-p-4">
                  <h3 className="cd-text-lg cd-font-bold cd-mb-3">{monthData.month}</h3>
                  
                  <div className="cd-flex cd-justify-between cd-mb-4">
                    <div className="cd-bg-green-100 dark:cd-bg-green-900/20 cd-p-2 cd-rounded">
                      <p className="cd-text-sm cd-text-gray-600 dark:cd-text-gray-400">Ingresos</p>
                      <p className="cd-text-lg cd-font-semibold cd-text-green-600 dark:cd-text-green-400">
                        ${monthData.income.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="cd-bg-red-100 dark:cd-bg-red-900/20 cd-p-2 cd-rounded">
                      <p className="cd-text-sm cd-text-gray-600 dark:cd-text-gray-400">Gastos</p>
                      <p className="cd-text-lg cd-font-semibold cd-text-red-600 dark:cd-text-red-400">
                        ${monthData.expense.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="cd-border-t cd-border-gray-200 dark:cd-border-gray-700 cd-pt-3 cd-mb-3">
                    <div className="cd-flex cd-justify-between cd-mb-1">
                      <p className="cd-font-medium">Balance Mensual:</p>
                      <p className={`cd-font-semibold ${monthData.monthly >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                        ${monthData.monthly.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="cd-flex cd-justify-between">
                      <p className="cd-font-medium">Balance Global:</p>
                      <p className={`cd-font-semibold ${monthData.global >= 0 ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                        ${monthData.global.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="cd-mt-3">
                    <p className="cd-font-medium cd-mb-2">Eventos ({monthData.events.length}):</p>
                    <div className="cd-max-h-40 cd-overflow-y-auto">
                      {monthData.events.map((event: any, index: number) => (
                        <div 
                          key={event._id || event.id || `event-${index}`} 
                          className="cd-mb-2 cd-pb-2 cd-border-b cd-border-gray-200 dark:cd-border-gray-700 cd-last:border-0 cd-cursor-pointer hover:cd-bg-gray-50 dark:hover:cd-bg-gray-800 cd-rounded cd-p-2 cd-transition-colors"
                          onClick={() => openEventDetails(event)}
                        >
                          <div className="cd-flex cd-justify-between cd-items-center">
                            <div className="cd-flex cd-items-center cd-gap-2">
                              <p className="cd-font-medium">{event.name}</p>
                              <div className="cd-flex cd-items-center cd-gap-2">
                                <button 
                                  onClick={(e) => handleEditEvent(e, event._id || event.id)}
                                  className="cd-text-gray-500 hover:cd-text-blue-500 cd-transition-colors cd-duration-200"
                                  title="Editar evento"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="cd-h-4 cd-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEventDetails(event);
                                    setTimeout(() => setIsDeleteConfirmMode(true), 100);
                                  }}
                                  className="cd-text-gray-500 hover:cd-text-red-500 cd-transition-colors cd-duration-200"
                                  title="Eliminar evento"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="cd-h-4 cd-w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className={`${event.type === 'income' ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                              ${typeof event.amount === 'number' ? event.amount.toFixed(2) : '0.00'}
                            </p>
                          </div>
                          <p className="cd-text-sm cd-text-gray-600 dark:cd-text-gray-400">
                            {new Date(typeof event.date === 'number' ? event.date * 1000 : Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="cd-bg-yellow-100 dark:cd-bg-yellow-900/20 cd-border-l-4 cd-border-yellow-500 cd-p-4">
          <div className="cd-flex">
            <div className="cd-flex-shrink-0">
              <svg className="cd-h-5 cd-w-5 cd-text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="cd-ml-3">
              <p className="cd-text-sm cd-text-yellow-700 dark:cd-text-yellow-200">
                No se encontraron eventos para mostrar. Por favor, verifica que existan eventos en la base de datos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para visualizar detalles del evento */}
      {isModalOpen && selectedEvent && (
        <div className="cd-fixed cd-inset-0 cd-bg-black dark:cd-bg-opacity-80 cd-bg-opacity-50 cd-flex cd-items-center cd-justify-center cd-z-50">

          <div className="cd-bg-white dark:cd-bg-gray-800 cd-rounded-lg cd-p-6 cd-max-w-2xl cd-w-full cd-max-h-[90vh] cd-overflow-y-auto">
            <div className="cd-flex cd-justify-between cd-items-start cd-mb-4">
              <h2 className="cd-text-xl cd-font-bold cd-text-gray-900 dark:cd-text-white">{selectedEvent.name}</h2>
              <button 
                onClick={closeModal}
                className="cd-text-gray-500 hover:cd-text-gray-700 dark:hover:cd-text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="cd-h-6 cd-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="cd-grid cd-grid-cols-1 md:cd-grid-cols-2 cd-gap-6">
              <div>
                <div className="cd-mb-4">
                  <p className="cd-text-sm cd-text-gray-500 dark:cd-text-gray-400">Descripción</p>
                  <p className="cd-text-base cd-text-gray-800 dark:cd-text-gray-200">{selectedEvent.description || 'Sin descripción'}</p>
                </div>
                
                <div className="cd-mb-4">
                  <p className="cd-text-sm cd-text-gray-500 dark:cd-text-gray-400">Fecha</p>
                  <p className="cd-text-base cd-text-gray-800 dark:cd-text-gray-200">
                    {new Date(typeof selectedEvent.date === 'number' ? selectedEvent.date * 1000 : Date.now()).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="cd-mb-4">
                  <p className="cd-text-sm cd-text-gray-500 dark:cd-text-gray-400">Monto</p>
                  <p className={`cd-text-lg cd-font-semibold ${selectedEvent.type === 'income' ? 'cd-text-green-600 dark:cd-text-green-400' : 'cd-text-red-600 dark:cd-text-red-400'}`}>
                    ${typeof selectedEvent.amount === 'number' ? selectedEvent.amount.toFixed(2) : '0.00'}
                  </p>
                </div>
                
                <div className="cd-mb-4">
                  <p className="cd-text-sm cd-text-gray-500 dark:cd-text-gray-400">Tipo</p>
                  <p className="cd-text-base cd-capitalize cd-text-gray-800 dark:cd-text-gray-200">{selectedEvent.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                </div>
              </div>
              
              <div>
                {selectedEvent.attachment && (
                  <div>
                    <p className="cd-text-sm cd-text-gray-500 dark:cd-text-gray-400 cd-mb-2">Imagen adjunta</p>
                    <div className="cd-border cd-border-gray-200 dark:cd-border-gray-700 cd-rounded-lg cd-overflow-hidden">
                      <img 
                        src={selectedEvent.attachment} 
                        alt="Adjunto" 
                        className="cd-w-full cd-h-auto cd-max-h-[400px] cd-object-contain cd-bg-white dark:cd-bg-gray-900"
                      />
                    </div>
                  </div>
                )}
                
                {!selectedEvent.attachment && (
                  <div className="cd-flex cd-items-center cd-justify-center cd-h-full cd-border cd-border-gray-200 dark:cd-border-gray-700 cd-rounded-lg cd-p-6 cd-bg-gray-50 dark:cd-bg-gray-900">
                    <p className="cd-text-gray-500 dark:cd-text-gray-400">Sin imagen adjunta</p>
                  </div>
                )}
              </div>
            </div>
            
            {!isDeleteConfirmMode ? (
              <div className="cd-mt-6 cd-flex cd-justify-end cd-gap-4">
                <button
                  onClick={activateDeleteConfirmMode}
                  className="cd-bg-red-500 cd-text-white cd-px-4 cd-py-2 cd-rounded-md hover:cd-bg-red-600 cd-transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={closeModal}
                  className="cd-bg-gray-200 dark:cd-bg-gray-700 cd-text-gray-800 dark:cd-text-gray-200 cd-px-4 cd-py-2 cd-rounded-md hover:cd-bg-gray-300 dark:hover:cd-bg-gray-600 cd-transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={(e) => {
                    closeModal();
                    handleEditEvent(e, selectedEvent._id || selectedEvent.id);
                  }}
                  className="cd-bg-blue-500 cd-text-white cd-px-4 cd-py-2 cd-rounded-md hover:cd-bg-blue-600 cd-transition-colors"
                >
                  Editar
                </button>
              </div>
            ) : (
              <div className="cd-mt-6">
                <div className="cd-bg-red-100 dark:cd-bg-red-900/30 cd-p-4 cd-rounded-lg cd-mb-4 cd-border cd-border-red-200 dark:cd-border-red-800">
                  <div className="cd-flex cd-items-center cd-mb-2">
                    <div className="cd-bg-red-200 dark:cd-bg-red-800 cd-p-2 cd-rounded-full cd-mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="cd-h-5 cd-w-5 cd-text-red-600 dark:cd-text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="cd-text-lg cd-font-medium cd-text-red-700 dark:cd-text-red-400">Confirmar eliminación</h3>
                  </div>
                  <p className="cd-text-red-700 dark:cd-text-red-300 cd-mb-2">
                    ¿Estás seguro que deseas eliminar el evento <span className="cd-font-semibold">"{selectedEvent.name}"</span>?
                  </p>
                  <p className="cd-text-sm cd-text-red-600 dark:cd-text-red-300">Esta acción no se puede deshacer.</p>
                </div>
                <div className="cd-flex cd-justify-end cd-gap-3">
                  <button
                    onClick={cancelDeleteConfirmMode}
                    className="cd-bg-gray-200 dark:cd-bg-gray-700 cd-text-gray-800 dark:cd-text-gray-200 cd-px-4 cd-py-2 cd-rounded-md hover:cd-bg-gray-300 dark:hover:cd-bg-gray-600 cd-transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="cd-bg-red-500 cd-text-white cd-px-4 cd-py-2 cd-rounded-md hover:cd-bg-red-600 cd-transition-colors"
                  >
                    Confirmar eliminación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No necesitamos un modal separado para la confirmación, ya usamos el modal existente */}
    </div>
  );
};

export default DirectFlowView;
