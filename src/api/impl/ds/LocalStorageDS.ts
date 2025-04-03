
import { v4 as uuid } from 'uuid'

import DataDS from '@api/domain/ds/DataDS'
import { EventCreateType, EventType } from '@customTypes/event'

const EVENT_KEY = 'events'

const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

class LocalStorageDS extends DataDS {

    getEvents() {
        try {
            const eventsRaw = localStorage.getItem(EVENT_KEY);

            return (eventsRaw ? JSON.parse(eventsRaw) : []) as EventType[];
        } catch (error) {
            console.error(error);
            throw new Error("Error a cargar los eventos");
        }
    }

    async loadEvents() {
        try {
            await sleep();
            const events = this.getEvents();

            return { events }

        } catch (error) {
            console.error(error);
            throw new Error("Error al cargar los eventos")
        }
    }

    async loadEventById(id: string) {
        try {
            await sleep();

            const events = this.getEvents();

            const event = events.find((event) => event.id === id);

            return { event };

        } catch (error) {
            console.error(error);
            throw new Error(`Error al cargar el evento ${id} `)
        }
    }

    async saveEvent(event: EventCreateType) {
        try {
            await sleep();

            const events = this.getEvents();

            const newEvents: EventType[] = events;

            newEvents.unshift({
                ...event,
                id: uuid(),
            });

            localStorage.setItem(EVENT_KEY, JSON.stringify(newEvents));

        } catch (error) {
            console.error(error);
            throw new Error(`Error al guardar el evento`)
        }
    }

    async updateEvent(id: string, event: EventCreateType){
        try{
            await sleep();
            const events = this.getEvents();
            const eventIndex = events.findIndex((event) => event.id === id)

            if(eventIndex === -1){
                throw new Error('Evento no encontrado')
            }

            const eventToUpdate = {
                ...events[eventIndex],
                ...event,
            };

            events[eventIndex] = eventToUpdate;
            localStorage.setItem(EVENT_KEY, JSON.stringify(events));

        }catch(error){
            console.error(error);
            throw new Error ("Error al actualizar el evento")
        }
    }

    async deleteEvent(id: string){
        try{
            await sleep();

            const events = this.getEvents();

            const eventIndex = events.filter((event) => event.id === id)

            if(eventIndex.length === 0){
                throw new Error("Evento no encontrado")
            }

            events.splice(events.indexOf(eventIndex[0]),1);
            localStorage.setItem(EVENT_KEY,JSON.stringify(events));

        }catch(error){
            console.error(error);
            throw new Error("Error al eliminar el evento")
        }
    }
}

export default LocalStorageDS;