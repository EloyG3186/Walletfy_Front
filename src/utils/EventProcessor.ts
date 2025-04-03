import { EventFlow, EventType } from '@customTypes/event';
import { EventFlowCalculator } from '@utils/EventFlowCalculator';
import moment from 'moment';

export class EventProcessor {
    static processEvents(events: EventType[], initialMoney: number): EventFlow {
        const eventFlow: EventFlow = {
            initialMoney,
            flows: []
        };

        events.forEach(event => {
            const id = moment.unix(event.date).format('YYYY-MM');
            this.addEventToFlow(eventFlow, id, event);
        });

        this.sortEventsFlow(eventFlow);
        return eventFlow;
    }

    static addEventToFlow(eventFlow: EventFlow, id: string, event: EventType): void {
        const flow = eventFlow.flows.find(flow => flow.id === id);
        if (flow) {
            flow.events.push(event);
            flow.income = EventFlowCalculator.calculateTotalIncome(flow.events);
            flow.expense = EventFlowCalculator.calculateTotalExpense(flow.events);
            flow.monthly = flow.income - flow.expense;
            flow.global = flow.monthly + eventFlow.initialMoney;
        } else {
            eventFlow.flows.push({
                id,
                events: [event],
                income: event.type === 'income' ? event.amount : 0,
                expense: event.type === 'expense' ? event.amount : 0,
                monthly: event.type === 'income' ? event.amount : -event.amount,
                global: event.type === 'income' ? event.amount + eventFlow.initialMoney : -event.amount + eventFlow.initialMoney,
            });
        }
    }

    static sortEventsFlow(eventFlow: EventFlow): void {
        eventFlow.flows.sort((a, b) => a.id.localeCompare(b.id));
    }
}


