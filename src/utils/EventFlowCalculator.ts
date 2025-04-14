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
        // Si es el primer mes, el global es el monthly + initialMoney
        // Si no, es el monthly + el global del mes anterior
        return index === 0 ? monthly + initialMoney : monthly + previousGlobal;
    }

    static calculateTotals = (eventFlow: EventFlow, initialMoney: number): EventFlow => {
        console.log('EventFlowCalculator - Calculando totales con dinero inicial:', initialMoney);
        console.log('EventFlowCalculator - Flujos recibidos:', eventFlow.flows.length);
        
        // Aseguramos que initialMoney esté actualizado
        const updatedEventFlow = {
            ...eventFlow,
            initialMoney: initialMoney
        };
        
        // Ordenamos los flujos por fecha para asegurar cálculos correctos
        const sortedFlows = [...updatedEventFlow.flows].sort((a, b) => a.id.localeCompare(b.id));
        console.log('EventFlowCalculator - Flujos ordenados:', sortedFlows.map(f => f.id));
        
        let previousGlobal = initialMoney;
        const updatedFlows = sortedFlows.map((flow, index) => {
            const totalIncome = this.calculateTotalIncome(flow.events);
            const totalExpense = this.calculateTotalExpense(flow.events);
            const monthly = totalIncome - totalExpense;
            const global = this.calculateGlobal(index, monthly, previousGlobal, initialMoney);
            
            console.log(`EventFlowCalculator - Mes ${flow.id}: Income=${totalIncome}, Expense=${totalExpense}, Monthly=${monthly}, Global=${global}`);
            
            // Actualizamos el previousGlobal para el siguiente mes
            previousGlobal = global;
            
            return {
                ...flow,
                income: totalIncome,
                expense: totalExpense,
                monthly: monthly,
                global: global,
            };
        });
        
        const result = {
            initialMoney: initialMoney,
            flows: updatedFlows,
        };
        
        console.log('EventFlowCalculator - Resultado final:', result);
        return result;
    };
}