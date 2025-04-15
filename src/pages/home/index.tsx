import { EventLoaderDataType } from "@customTypes/event";
import { QKeys } from "@constants/query";
import { isLoadingOrRefetchQuery } from "@utils/query";
import NumberInput from '@components/form/NumberInput';
import Button from '@components/form/Button';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";

import DataRepo from "@api/datasource";
import DirectFlowView from './DirectFlowView';



const Home = () => {
    const { state } = useParams<{ state: string }>();
    const { state: authState } = useAuth();
    const navigate = useNavigate();
    const [initialMoney, setInitialMoney] = useState(0);
    
    // Usar el dinero inicial del usuario si está autenticado
    useEffect(() => {
        if (authState.user && authState.user.initialMoney) {
            setInitialMoney(authState.user.initialMoney);
        }
    }, [authState.user]);

    const eventQuery = useQuery<
        EventLoaderDataType,
        Error,
        EventLoaderDataType,
        [string, string | undefined]
    >({
        queryKey: [QKeys.GET_EVENTS, state],
        queryFn: ({ queryKey }) => {
            // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
            if (!authState.isAuthenticated && !authState.loading) {
                navigate('/login');
                return { events: [] };
            }
            
            // Obtener el tipo de filtro si es válido (income o expense)
            const filterType = state === 'income' || state === 'expense' ? state : undefined;
            console.log('Filtrando eventos por tipo:', filterType || 'todos');
            
            return DataRepo.loadEvents(filterType);
        },
        enabled: !authState.loading, // Solo ejecutar la consulta cuando la autenticación no esté cargando
    });

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
                                        onChange={(value) => {
                                            setInitialMoney(value);
                                            // Forzar recarga de datos cuando cambia el dinero inicial
                                            setTimeout(() => eventQuery.refetch(), 100);
                                        }}
                                    />
                                    <Button
                                        caption="Recalcular"
                                        onClick={() => {
                                            // Forzar recarga de datos
                                            eventQuery.refetch();
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
                                    <p className='cd-mb-2 cd-pt-4 cd-self-start cd-font-sans cd-font-medium cd-text-xl cd-text-center'>
                                        {authState.user ? `Eventos de ${authState.user.firstName}` : 'Tus Eventos'}
                                    </p>
                                    

                                    
                                    <div className="cd-w-full">

                                        
                                        <DirectFlowView initialMoney={initialMoney} />
                                    </div>
                                </div>
                            )}

                        {!isLoading && (!data?.events || data.events.length === 0) && (
                            <div className='cd-flex cd-flex-col cd-items-center cd-justify-center cd-h-full cd-pt-56 cd-pb-80'>
                                <h1 className="cd-text-3xl cd-font-bold cd-text-center dark:cd-text-gray-300 ">
                                    {authState.user ? `¡Hola ${authState.user.firstName}! Tu billetera virtual está vacía` : 'Billetera virtual vacía'}
                                </h1>
                                <p className="cd-mt-4 cd-text-lg cd-text-center dark:cd-text-gray-400">
                                    Comienza a registrar tus ingresos y gastos para llevar un mejor control de tus finanzas
                                </p>
                            </div>
                        )}




                    </div>
                )}
            </React.Fragment>
        </div>
    );
};



export default Home;