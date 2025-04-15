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
   * Carga los eventos desde la API
   */
  async loadEvents(type?: 'income' | 'expense') {
    try {
      // Verificar si hay token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('ApiDS - No hay token de autenticación');
        return { events: [] };
      }

      // Construir la URL con el filtro de tipo si se proporciona
      let url = '/events';
      if (type) {
        url += `?type=${type}`;
      }

      // Realizar la petición a la API
      const response = await this.fetchApi(url, {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      
      // Si hay un error de autenticación, devolver un array vacío
      if (error instanceof Error && error.message.includes('No autorizado')) {
        return { events: [] };
      }
      
      throw error;
    }
  }

  /**
   * Crea un nuevo evento
   */
  async createEvent(event: EventCreateType) {
    // Convertir el evento a JSON
    const eventData = JSON.stringify(event);
    
    // Calcular el tamaño aproximado de los datos en MB
    const dataSizeInMB = new Blob([eventData]).size / (1024 * 1024);
    
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
      const response = await this.fetchApi('/events', {
        method: 'POST',
        body: eventData
      });
      
      return response;
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
    // Convertir el evento a JSON
    const eventData = JSON.stringify(event);
    
    // Calcular el tamaño aproximado de los datos en MB
    const dataSizeInMB = new Blob([eventData]).size / (1024 * 1024);
    
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
   * Implementación de saveEvent para cumplir con la interfaz DataDS
   * Este método simplemente llama a createEvent
   */
  async saveEvent(event: EventCreateType): Promise<void> {
    return this.createEvent(event);
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

  /**
   * Obtener estadísticas de gastos diarios
   */
  async fetchDailyStats(year: number, month: number) {
    try {
      const response = await this.fetchApi(`/stats/daily?year=${year}&month=${month}`, {
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas diarias:', error);
      return { success: false, stats: { labels: [], data: [], total: 0 } };
    }
  }

  /**
   * Obtener estadísticas de gastos semanales
   */
  async fetchWeeklyStats(year: number, month: number) {
    try {
      const response = await this.fetchApi(`/stats/weekly?year=${year}&month=${month}`, {
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas semanales:', error);
      return { success: false, stats: { labels: [], data: [], total: 0 } };
    }
  }

  /**
   * Obtener estadísticas de gastos por categoría
   */
  async fetchCategoryStats(year: number, month: number) {
    try {
      const response = await this.fetchApi(`/stats/category?year=${year}&month=${month}`, {
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas por categoría:', error);
      return { success: false, stats: { labels: [], data: [], total: 0 } };
    }
  }

  /**
   * Obtener períodos (años y meses) con transacciones
   */
  async fetchTransactionPeriods() {
    try {
      const response = await this.fetchApi('/stats/periods', {
        method: 'GET'
      });
      
      return response;
    } catch (error) {
      console.error('Error al obtener períodos con transacciones:', error);
      return { 
        success: false, 
        periods: [] 
      };
    }
  }
}

export const apiDS = new ApiDS();
export default ApiDS;
