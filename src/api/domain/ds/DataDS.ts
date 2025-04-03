import { 
    EventCreateType,
    EventLoaderDataType,
    EventByIdLoaderDataType
 } from "@customTypes/event";


 abstract class DataDS{
    abstract loadEvents(type?: string): Promise<EventLoaderDataType>;
    abstract loadEventById(id: string): Promise<EventByIdLoaderDataType>;
    abstract saveEvent(event: EventCreateType): Promise<void>;
    abstract updateEvent(id: string, event: EventCreateType): Promise<void>;
    abstract deleteEvent(id: string): Promise<void>;
 }

 export default DataDS;