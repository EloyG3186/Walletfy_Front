import DataDS from "@api/domain/ds/DataDS";

import { 
    EventByIdLoaderDataType,
    EventCreateType,
    EventLoaderDataType
} from "@customTypes/event";

class DataRepoImpl{

    private data: DataDS;

    constructor(data: DataDS){
        this.data = data;
    }

    async loadEvents(type?: string): Promise<EventLoaderDataType>{
        return await this.data.loadEvents(type);
    }

    async loadEventById(id: string): Promise<EventByIdLoaderDataType>{
        return await this.data.loadEventById(id);
    }

    async saveEvent(event: EventCreateType): Promise<void>{
        return await this.data.saveEvent(event);
    }

    async updateEvent (id: string, event: EventCreateType): Promise<void>{
        return this.data.updateEvent(id, event);
    }

    async deleteEvent(id: string): Promise<void>{
        return this.data.deleteEvent(id);
    }

}

export default DataRepoImpl;