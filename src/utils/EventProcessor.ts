import { EventFlow, EventType } from '@customTypes/event';
import { EventFlowCalculator } from '@utils/EventFlowCalculator';
import moment from 'moment';

export class EventProcessor {
    static processEvents(events: EventType[], initialMoney: number): EventFlow {
        console.log('EventProcessor - Procesando eventos:', events);
        console.log('EventProcessor - Número de eventos:', events.length);
        console.log('EventProcessor - Dinero inicial:', initialMoney);
        
        // Verificar si los eventos tienen la estructura correcta
        if (events.length > 0) {
            console.log('EventProcessor - Ejemplo de evento:', JSON.stringify(events[0], null, 2));
        }
        
        const eventFlow: EventFlow = {
            initialMoney,
            flows: []
        };

        // Agrupar eventos por mes
        events.forEach(event => {
            // Verificar que event.date sea un número válido
            if (!event.date || typeof event.date !== 'number') {
                console.error(`EventProcessor - Error: evento con fecha inválida:`, event);
                return; // Saltar este evento
            }
            
            const id = moment.unix(event.date).format('YYYY-MM');
            console.log(`EventProcessor - Agrupando evento ${event.name} (${event.type}) en mes ${id}`);
            this.addEventToFlow(eventFlow, id, event);
        });

        // Ordenar flujos por fecha
        this.sortEventsFlow(eventFlow);
        console.log('EventProcessor - Flujos agrupados por mes:', eventFlow.flows.length, 'meses');
        console.log('EventProcessor - Detalle de flujos:', eventFlow.flows);
        
        // Calcular totales acumulativos usando EventFlowCalculator
        const result = EventFlowCalculator.calculateTotals(eventFlow, initialMoney);
        console.log('EventProcessor - Resultado final:', result);
        return result;
    }

    static addEventToFlow(eventFlow: EventFlow, id: string, event: EventType): void {
        const flow = eventFlow.flows.find(flow => flow.id === id);
        if (flow) {
            // Agregar evento a un flujo existente
            flow.events.push(event);
            // Los valores se recalcularán más tarde en calculateTotals
        } else {
            // Crear un nuevo flujo para este mes
            eventFlow.flows.push({
                id,
                events: [event],
                income: 0, // Se calculará después
                expense: 0, // Se calculará después
                monthly: 0, // Se calculará después
                global: 0, // Se calculará después
            });
        }
    }

    static sortEventsFlow(eventFlow: EventFlow): void {
        eventFlow.flows.sort((a, b) => a.id.localeCompare(b.id));
    }
}


