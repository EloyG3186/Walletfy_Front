import { z } from 'zod';

export const EventSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    date: z.number(),
    amount: z.number(),
    type: z.enum(['income', 'expense']),
    attachment: z.string(),
});

export type EventType = z.infer<typeof EventSchema>;
//Loaders
export const EventLoaderDataSchema = z.object({ events: z.array(EventSchema), })
export type EventLoaderDataType = z.infer<typeof EventLoaderDataSchema>

export const EventByIdLoaderDataSchema = z.object({ event: EventSchema.optional(), })
export type EventByIdLoaderDataType = z.infer<typeof EventByIdLoaderDataSchema>

//From
export const EventCreateSchema = EventSchema.omit({ id: true })
export type EventCreateType = z.infer<typeof EventCreateSchema>

export const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export type FlowType ={
    id: string,
    events: EventType[],
    income: number,
    expense: number,
    monthly: number,
    global: number,
}

export type EventFlow = {
    initialMoney: number,
    flows: FlowType[],
}