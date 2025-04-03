import { EventLoaderDataType, EventFlow } from "@customTypes/event";
import { QKeys } from "@constants/query";
import { isLoadingOrRefetchQuery } from "@utils/query";
import NumberInput from '@components/form/NumberInput';
import Button from '@components/form/Button';
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from 'react';

import { EventFlowCalculator } from '@utils/EventFlowCalculator';
import { EventProcessor } from '@utils/EventProcessor';

import DataRepo from "@api/datasource";
import EventBalance from '@components/EventBalance';

const INITIAL_FLOWS = {
    initialMoney: 0,
    flows: []
}

const Home = () => {

    const { state } = useParams<{ state: string }>();
    const [initialMoney, setInitialMoney] = useState(0);
    const [eventsFlow, setEventsFlow] = useState<EventFlow>(INITIAL_FLOWS);

    const eventQuery = useQuery<
        EventLoaderDataType,
        Error,
        EventLoaderDataType,
        [string, string | undefined]
    >({
        queryKey: [QKeys.GET_EVENTS, state],
        queryFn: ({ queryKey }) => {
            return DataRepo.loadEvents(queryKey[0]);
        },
    });

    useEffect(() => {
        if (eventQuery.data?.events) {
            const processedEventsFlow = EventProcessor.processEvents(eventQuery.data.events, eventsFlow.initialMoney);
            setEventsFlow(processedEventsFlow);
        }
    }, [eventQuery.data]);

    const { data } = eventQuery;
    const isLoading = isLoadingOrRefetchQuery(eventQuery);

    return (
        <div id="home" className="cd-h-full cd-overflow-hidden ">
            <React.Fragment>
                {isLoading && (
                    <p className="cd-py-52 cd-text-2xl cd-text-zinc-800 dark:cd-text-gray-300 cd-font-bold cd-font-sans cd-text-center">
                        Cargando balances...
                    </p>

                )}

                {!isLoading && data && (
                    <div className="cd-mx-4 sm:cd-mx-8 md:cd-mx-12 lg:cd-mx-20 cd-my-10 cd-pt-10">
                        <div className="cd-flex cd-flex-col md:cd-flex-row cd-justify-items-start cd-gap-y-[2rem] cd-font-sans ">
                            <div className='cd-flex cd-flex-col md:cd-flex-row md:cd-items-end cd-justify-between cd-w-full cd-gap-4' >
                                <div className='cd-flex cd-flex-col sm:cd-flex-row cd-items-start sm:cd-items-end cd-gap-2' >
                                    <NumberInput
                                        className="cd-w-full sm:cd-w-auto"
                                        label="Initial Money"
                                        value={initialMoney}
                                        onChange={setInitialMoney}
                                    />
                                    <Button
                                        caption="Calcular"
                                        onClick={() => {
                                            setEventsFlow(prev => ({ ...prev, initialMoney: initialMoney }));
                                            const updatedEventsFlow = EventFlowCalculator.calculateTotals(eventsFlow, initialMoney);
                                            setEventsFlow(updatedEventsFlow)
                                            //alert("calculado")
                                        }}
                                    />
                                </div>
                                <a
                                    href="/events/form"
                                    className="cd-bg-violet-500 cd-text-white cd-text-lg cd-font-medium cd-px-7 cd-py-3 cd-rounded-md hover:cd-bg-violet-700 cd-w-full md:cd-w-auto cd-text-center">
                                    Add Event
                                </a>
                            </div>
                        </div >

                            {!isLoading && data?.events && data.events.length > 0 && (
                                <div className='cd-flex cd-flex-col cd-gap-4 cd-items-center cd-text-center dark:cd-text-white cd-pt-8'>
                                    <p className='cd-mb-2 cd-pt-4 cd-self-start cd-font-sans cd-font-medium cd-text-xl cd-text-center'>Your Events</p>
                                    <div className='cd-grid cd-grid-cols-1 md:cd-grid-cols-2 lg:cd-grid-cols-4 cd-gap-4'>
                                        {eventsFlow.flows.map(flow => {
                                            return (
                                                <EventBalance key={flow.id} data={flow} />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {!isLoading && (!data?.events || data.events.length === 0) && (
                            <div className='cd-flex cd-flex-col cd-items-center cd-justify-center cd-h-full cd-pt-56 cd-pb-80'>
                                <h1 className="cd-text-3xl cd-font-bold cd-text-center dark:cd-text-gray-300 ">
                                    Empty virtual wallet
                                </h1>
                            
                            </div>
                        )}


                    </div>
                )}
            </React.Fragment>
        </div>
    );
};



export default Home;