import DataDS from '@api/domain/ds/DataDS';
import { EventCreateType } from '@customTypes/event';
import { API_URL } from '@config/api';

class ApiDS extends DataDS {
  private baseUrl: string;

  constructor(baseUrl = API_URL) {
    super();
    this.baseUrl = baseUrl;
  }

  /**
   * Método auxiliar para realizar peticiones HTTP
   */
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Obtener el token de autenticación del localStorage
      const token = localStorage.getItem('token');
      
      // Preparar los headers con el token de autenticación si existe
      const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        ...(options.headers as Record<string, string> || {})
      };
      
      // Agregar el token de autenticación si existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        headers,
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en la petición:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los eventos
   */
  async loadEvents(type?: string) {
    try {
      // Solo incluir el parámetro de tipo si es 'income' o 'expense'
      const queryParams = (type === 'income' || type === 'expense') ? 
        `?type=${encodeURIComponent(type)}` : '';
      
      // Verificar si hay token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('ApiDS - No hay token de autenticación, no se pueden cargar eventos');
        return { events: [] };
      }
      
      console.log('ApiDS - Obteniendo eventos con token:', token.substring(0, 15) + '...');
      
      const data = await this.fetchApi(`/events${queryParams}`);
      
      console.log('ApiDS - Datos recibidos de la API:', data);
      
      // Asegurarse de que events sea un array
      if (!data.events || !Array.isArray(data.events)) {
        console.warn('ApiDS - No hay eventos en la API o formato incorrecto');
        return { events: [] };
      }
      
      console.log('ApiDS - Eventos del usuario:', data.events.length);
      
      // Transformar los eventos para que coincidan con el tipo EventType
      const transformedEvents = data.events.map((event: any) => {
        // Verificar que el evento tenga todos los campos necesarios
        if (!event || typeof event !== 'object') {
          console.error('ApiDS - Error: evento inválido:', event);
          return null;
        }
        
        // Registrar cada evento para depuración
        console.log('ApiDS - Procesando evento:', {
          id: event._id,
          name: event.name,
          type: event.type,
          amount: event.amount
        });
        
        return {
          id: event._id || '',
          name: event.name || '',
          description: event.description || '',
          date: typeof event.date === 'number' ? event.date : 0,
          amount: typeof event.amount === 'number' ? event.amount : 0,
          type: event.type === 'income' || event.type === 'expense' ? event.type : 'expense',
          attachment: event.attachment || ''
        };
      }).filter(event => event !== null); // Filtrar eventos nulos
      
      console.log('ApiDS - Eventos transformados:', transformedEvents.length);
      return { events: transformedEvents };
    } catch (error) {
      console.error('ApiDS - Error al cargar eventos:', error);
      return { events: [] };
    }
  }

  /**
   * Obtiene un evento por su ID
   */
  async loadEventById(id: string) {
    try {
      const data = await this.fetchApi(`/events/${encodeURIComponent(id)}`);
      console.log('ApiDS - Datos de evento recibidos de la API:', data);
      
      if (!data.event) {
        console.log('ApiDS - No se encontró el evento con ID:', id);
        return { event: undefined };
      }
      
      // Si el evento es una cadena JSON, intentar parsearlo
      let eventObj = data.event;
      if (typeof data.event === 'string') {
        try {
          eventObj = JSON.parse(data.event);
        } catch (error) {
          console.error('ApiDS - Error al parsear evento:', error);
          return { event: undefined };
        }
      }
      
      // Transformar el evento para que coincida con el tipo EventType
      const transformedEvent = {
        id: eventObj._id || '',
        name: eventObj.name || '',
        description: eventObj.description || '',
        date: typeof eventObj.date === 'number' ? eventObj.date : 0,
        amount: typeof eventObj.amount === 'number' ? eventObj.amount : 0,
        type: eventObj.type === 'income' || eventObj.type === 'expense' ? eventObj.type : 'expense',
        attachment: eventObj.attachment || ''
      };
      
      console.log('ApiDS - Evento transformado:', transformedEvent);
      return { event: transformedEvent };
    } catch (error) {
      console.error('ApiDS - Error al cargar evento por ID:', error);
      return { event: undefined };
    }
  }

  /**
   * Guarda un nuevo evento
   */
  async saveEvent(event: EventCreateType) {
    // Validar el tamaño de los datos antes de enviarlos
    const eventData = JSON.stringify(event);
    const dataSizeInMB = new Blob([eventData]).size / (1024 * 1024);
    
    console.log(`ApiDS - Tamaño de datos a enviar: ${dataSizeInMB.toFixed(2)}MB`);
    
    // Si el tamaño es mayor a 0.5MB, mostrar un error (límite más estricto)
    if (dataSizeInMB > 0.5) {
      console.warn(`ApiDS - Tamaño de datos demasiado grande: ${dataSizeInMB.toFixed(2)}MB`);
      throw new Error(`El tamaño del evento es demasiado grande (${dataSizeInMB.toFixed(2)}MB). Intente reducir el tamaño de la imagen adjunta o no incluir imagen.`);
    }
    
    // Verificar si hay una imagen adjunta en base64 y su tamaño
    if (event.attachment && typeof event.attachment === 'string' && event.attachment.startsWith('data:image')) {
      const base64Data = event.attachment.split(',')[1];
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const sizeInKB = sizeInBytes / 1024;
      
      console.log(`ApiDS - Tamaño de la imagen adjunta: ${sizeInKB.toFixed(2)}KB`);
      
      if (sizeInKB > 300) {
        throw new Error(`La imagen adjunta es demasiado grande (${(sizeInKB/1024).toFixed(2)}MB). El límite es 300KB.`);
      }
    }
    
    try {
      await this.fetchApi('/events', {
        method: 'POST',
        body: eventData
      });
    } catch (error: any) {
      // Manejar específicamente el error de tamaño
      if (error.message && error.message.includes('request entity too large')) {
        throw new Error('El archivo adjunto es demasiado grande. Por favor, use una imagen más pequeña o de menor resolución.');
      }
      throw error;
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(id: string, event: EventCreateType) {
    // Validar el tamaño de los datos antes de enviarlos
    const eventData = JSON.stringify(event);
    const dataSizeInMB = new Blob([eventData]).size / (1024 * 1024);
    
    console.log(`ApiDS - Tamaño de datos a enviar: ${dataSizeInMB.toFixed(2)}MB`);
    
    // Si el tamaño es mayor a 0.5MB, mostrar un error (límite más estricto)
    if (dataSizeInMB > 0.5) {
      console.warn(`ApiDS - Tamaño de datos demasiado grande: ${dataSizeInMB.toFixed(2)}MB`);
      throw new Error(`El tamaño del evento es demasiado grande (${dataSizeInMB.toFixed(2)}MB). Intente reducir el tamaño de la imagen adjunta o no incluir imagen.`);
    }
    
    // Verificar si hay una imagen adjunta en base64 y su tamaño
    if (event.attachment && typeof event.attachment === 'string' && event.attachment.startsWith('data:image')) {
      const base64Data = event.attachment.split(',')[1];
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const sizeInKB = sizeInBytes / 1024;
      
      console.log(`ApiDS - Tamaño de la imagen adjunta: ${sizeInKB.toFixed(2)}KB`);
      
      if (sizeInKB > 300) {
        throw new Error(`La imagen adjunta es demasiado grande (${(sizeInKB/1024).toFixed(2)}MB). El límite es 300KB.`);
      }
    }
    
    try {
      await this.fetchApi(`/events/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: eventData
      });
    } catch (error: any) {
      // Manejar específicamente el error de tamaño
      if (error.message && error.message.includes('request entity too large')) {
        throw new Error('El archivo adjunto es demasiado grande. Por favor, use una imagen más pequeña o de menor resolución.');
      }
      throw error;
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(id: string) {
    return this.fetchApi(`/events/${id}`, {
      method: 'DELETE'
    });
  }
  
  /**
   * Genera datos de prueba para mostrar en la aplicación
   * cuando no hay eventos disponibles en la API
   */
  private generateMockEvents() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Crear eventos para los últimos 3 meses
    const mockEvents = [];
    
    // Mes actual
    mockEvents.push(
      // Ingresos
      {
        _id: 'mock-income-1',
        name: 'Salario',
        description: 'Salario mensual',
        date: Math.floor(new Date(currentYear, currentMonth, 15).getTime() / 1000),
        amount: 2500,
        type: 'income'
      },
      {
        _id: 'mock-income-2',
        name: 'Freelance',
        description: 'Proyecto freelance',
        date: Math.floor(new Date(currentYear, currentMonth, 20).getTime() / 1000),
        amount: 800,
        type: 'income'
      },
      // Gastos
      {
        _id: 'mock-expense-1',
        name: 'Alquiler',
        description: 'Alquiler mensual',
        date: Math.floor(new Date(currentYear, currentMonth, 5).getTime() / 1000),
        amount: 1200,
        type: 'expense'
      },
      {
        _id: 'mock-expense-2',
        name: 'Supermercado',
        description: 'Compra semanal',
        date: Math.floor(new Date(currentYear, currentMonth, 10).getTime() / 1000),
        amount: 150,
        type: 'expense'
      },
      {
        _id: 'mock-expense-3',
        name: 'Internet',
        description: 'Factura mensual',
        date: Math.floor(new Date(currentYear, currentMonth, 8).getTime() / 1000),
        amount: 60,
        type: 'expense'
      }
    );
    
    // Mes anterior
    mockEvents.push(
      // Ingresos
      {
        _id: 'mock-income-3',
        name: 'Salario',
        description: 'Salario mensual',
        date: Math.floor(new Date(currentYear, currentMonth - 1, 15).getTime() / 1000),
        amount: 2500,
        type: 'income'
      },
      {
        _id: 'mock-income-4',
        name: 'Dividendos',
        description: 'Dividendos trimestrales',
        date: Math.floor(new Date(currentYear, currentMonth - 1, 22).getTime() / 1000),
        amount: 350,
        type: 'income'
      },
      // Gastos
      {
        _id: 'mock-expense-4',
        name: 'Alquiler',
        description: 'Alquiler mensual',
        date: Math.floor(new Date(currentYear, currentMonth - 1, 5).getTime() / 1000),
        amount: 1200,
        type: 'expense'
      },
      {
        _id: 'mock-expense-5',
        name: 'Supermercado',
        description: 'Compra semanal',
        date: Math.floor(new Date(currentYear, currentMonth - 1, 10).getTime() / 1000),
        amount: 180,
        type: 'expense'
      },
      {
        _id: 'mock-expense-6',
        name: 'Electricidad',
        description: 'Factura bimestral',
        date: Math.floor(new Date(currentYear, currentMonth - 1, 12).getTime() / 1000),
        amount: 90,
        type: 'expense'
      }
    );
    
    // Hace dos meses
    mockEvents.push(
      // Ingresos
      {
        _id: 'mock-income-5',
        name: 'Salario',
        description: 'Salario mensual',
        date: Math.floor(new Date(currentYear, currentMonth - 2, 15).getTime() / 1000),
        amount: 2500,
        type: 'income'
      },
      {
        _id: 'mock-income-6',
        name: 'Reembolso',
        description: 'Reembolso de gastos',
        date: Math.floor(new Date(currentYear, currentMonth - 2, 18).getTime() / 1000),
        amount: 120,
        type: 'income'
      },
      // Gastos
      {
        _id: 'mock-expense-7',
        name: 'Alquiler',
        description: 'Alquiler mensual',
        date: Math.floor(new Date(currentYear, currentMonth - 2, 5).getTime() / 1000),
        amount: 1200,
        type: 'expense'
      },
      {
        _id: 'mock-expense-8',
        name: 'Supermercado',
        description: 'Compra semanal',
        date: Math.floor(new Date(currentYear, currentMonth - 2, 10).getTime() / 1000),
        amount: 160,
        type: 'expense'
      },
      {
        _id: 'mock-expense-9',
        name: 'Seguro',
        description: 'Seguro del coche',
        date: Math.floor(new Date(currentYear, currentMonth - 2, 20).getTime() / 1000),
        amount: 220,
        type: 'expense'
      }
    );
    
    return mockEvents;
  }
}

export default ApiDS;
