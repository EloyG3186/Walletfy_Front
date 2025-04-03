import { EventType, EventFlow } from '@customTypes/event';

export class EventFlowCalculator {
    static calculateTotalIncome(events: EventType[]): number {
        return events
            .filter(event => event.type === 'income')
            .reduce((sum, event) => sum + event.amount, 0);
    }

    static calculateTotalExpense(events: EventType[]): number {
        return events
            .filter(event => event.type === 'expense')
            .reduce((sum, event) => sum + event.amount, 0);
    }

    static calculateGlobal(index: number, monthly: number, previousGlobal: number, initialMoney: number): number {
        return index === 0 ? monthly + initialMoney : monthly + previousGlobal;
    }

    static calculateTotals = (eventFlow:EventFlow, initialMoney: number): EventFlow => {
            let previousGlobal = eventFlow.initialMoney;
            const updatedFlows = eventFlow.flows.map((flow, index) => {
                const totalIncome = this.calculateTotalIncome(flow.events);
                const totalExpense = this.calculateTotalExpense(flow.events);
                const monthly = totalIncome - totalExpense;
                const global = this.calculateGlobal(index, monthly, previousGlobal, initialMoney);
                previousGlobal = global;
                return {
                    ...flow,
                    income: totalIncome,
                    expense: totalExpense,
                    monthly: monthly,
                    global: global,
                };
            });
            return {
                ...eventFlow,
                flows: updatedFlows,
            };
    };
}