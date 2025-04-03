import DataDS from '@api/domain/ds/DataDS';
import { EventCreateType, EventType } from '@customTypes/event';
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
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8',
          ...options.headers
        },
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
    const queryParams = type ? `?type=${encodeURIComponent(type)}` : '';
    const data = await this.fetchApi(`/events${queryParams}`);
    return { events: data.events };
  }

  /**
   * Obtiene un evento por su ID
   */
  async loadEventById(id: string) {
    const data = await this.fetchApi(`/events/${encodeURIComponent(id)}`);
    return { event: data.event };
  }

  /**
   * Guarda un nuevo evento
   */
  async saveEvent(event: EventCreateType) {
    await this.fetchApi('/events', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(id: string, event: EventCreateType) {
    await this.fetchApi(`/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    });
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(id: string) {
    await this.fetchApi(`/events/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }
}

export default ApiDS;
