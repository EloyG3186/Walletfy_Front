import { $ } from '@utils/styles';
import React from 'react';
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import {
    EventByIdLoaderDataType,
    EventCreateType,
    EventCreateSchema
} from '@customTypes/event';

import DataRepo from '@api/datasource';
import { QKeys } from '@constants/query';
import { isLoadingMutation, isLoadingOrRefetchQuery } from '@utils/query';

import Input from '@components/form/Input';
import InputDate from '@components/form/InputDate';
import NumberInput from '@components/form/NumberInput';
import SelectInput from '@components/form/Select';
import Attachment from '@components/form/Attachment';

type Params = { id: string }

const INITIAL_STATE: EventCreateType = {
    name: '',
    description: '',
    date: moment().unix(),
    amount: 0,
    type: 'income',
    attachment: '',
}

//EventForm maneja el formulario y lógica para crear nuevos eventos
// USE STATE= para manejar el estado de los campos del formulario.
const EventForm = () => {

    const { id } = useParams<Params>()
    const navigate = useNavigate();
    const inputRef = React.useRef<HTMLAnchorElement>(null)
    const [mode] = React.useState(id ? 'edit' : 'create');

    const { handleSubmit, control, formState, reset } = useForm<EventCreateType>({
        defaultValues: INITIAL_STATE,
        resolver: zodResolver(EventCreateSchema),
    })

    const eventQuery = useQuery<
        EventByIdLoaderDataType,
        Error,
        EventByIdLoaderDataType,
        [string, string | undefined]
    >({
        enabled: Boolean(id),
        queryKey: [QKeys.GET_EVENT, id],
        queryFn: async ({ queryKey }) => {
            return await DataRepo.loadEventById(queryKey[1]!);
        }
    })

    const eventCreateMutation = useMutation<void, Error, EventCreateType>({
        mutationFn: async (event) => {
            console.log("eventCreateMutation", event);
            alert('Event guardado');

            return await DataRepo.saveEvent(event);

        },
        onSettled: (_, error) => {
            if (error) {
                alert('Error al guardar el evento');
                return;
            }
            reset(INITIAL_STATE);
            navigate('/');
        }
    })

    const eventUpdateMutation = useMutation<void, Error, EventCreateType>({
        mutationFn: async (event) => {
            return await DataRepo.updateEvent(id!, event);
        },
        onSettled: (_, error) => {
            if (error) {
                alert('Error al actualizar el evento');
                return;
            }
            alert('Evento actualizado');
            reset(INITIAL_STATE);
            navigate('/');
        }
    })

    React.useEffect(() => {
        if (mode === 'create' || !eventQuery.data?.event) {
            return;
        }
        reset(eventQuery.data.event)
        // eslint-diabled next-line react-hooks/exhaustive-deps
    }, [eventQuery.data?.event])

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        return () => {
            console.log('Unmount');
            reset(INITIAL_STATE)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const isLoadingForm = isLoadingMutation(
        eventCreateMutation,
        eventUpdateMutation
    );

    const isLoadingQuery = isLoadingOrRefetchQuery(eventQuery);

    return (
        <div className='cd-container cd-mx-auto px-4 py-8'>

            {isLoadingQuery && (
                <p className='cd-text-2xl cd-font-bold cd-text-center'>Loading Form</p>
            )}


            {!isLoadingQuery && (
                <section className="cd-w-full">
                    <main className={$("cd-flex cd-transition-colors ",
                        "cd-duration-500  ",
                        "cd-flex-col cd-items-center cd-w-full ",
                        "cd-pt-5 cd-pb-14 cd-justify-center")}>
                        <div className={$(" cd-px-10  cd-mt-8 ",
                            "cd-flex cd-flex-col cd-transition-colors ",
                            "cd-duration-500 ")}

                        >
                            <form
                                className='cd-flex cd-flex-col cd-text-lg cd-gap-4 dark:cd-text-white'
                                onSubmit={handleSubmit((data) => {

                                    console.log(mode, data)

                                    if (mode === 'edit' && id) {
                                        eventUpdateMutation.mutate(data);
                                    } else {
                                        eventCreateMutation.mutate(data);
                                    }
                                })
                                }
                            >
                                <div className='cd-flex cd-flex-row cd-justify-center cd-items-center '>
                                    <button
                                        type='button'
                                        onClick={() => navigate('/')}
                                        className="cd-flex cd-items-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="size-6"
                                            width="32px"
                                            height="32px"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                            />
                                        </svg>
                                    </button>


                                    <h1 className='cd-text-4xl cd-flex-grow cd-text-center cd-font-bold'>Event Form</h1>
                                </div>

                                <h1 className='cd-font-bold'>
                                    {mode === 'edit' ? 'Edit' : 'Create'} Event
                                </h1>

                                <Controller
                                    name='name'
                                    control={control}
                                    render={({ field: { onChange, value } }) => (

                                        <Input
                                            className='cd-py-1'
                                            label="Name"
                                            value={value}
                                            onChange={onChange}
                                            error={formState.errors?.name?.message}
                                        />
                                    )}
                                />



                                <Controller
                                    name='description'
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Description"
                                            value={value}
                                            onChange={onChange}
                                            error={formState.errors?.description?.message}

                                        />
                                    )}
                                />



                                <Controller
                                    name='date'
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <InputDate
                                            label="Date"
                                            value={value}
                                            onChange={onChange}
                                            error={formState.errors?.date?.message}
                                        />

                                    )}
                                />



                                <Controller
                                    name='amount'
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <NumberInput
                                            label="Amount"
                                            value={value}
                                            onChange={onChange}
                                            error={formState.errors?.amount?.message}
                                        />
                                    )}
                                />



                                <Controller
                                    name='type'
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <SelectInput
                                            label="Type"
                                            value={value}
                                            options={['income', 'expense']}
                                            onChange={onChange}
                                        />
                                    )}
                                />


                                <Controller
                                    name='attachment'
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <Attachment
                                            label="Attachment"
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                />

                                <button className={$('cd-self-center cd-mt-4 ',
                                    'cd-font-medium cd-text-lg ',
                                    'cd-font-sans cd-px-4 sm:cd-px-8 md:cd-px-16 lg:cd-px-32 xl:cd-px-80 cd-py-4 ',
                                    'cd-bg-violet-500 cd-text-white cd-w-full sm:cd-w-auto ',
                                    'cd-rounded-md hover:cd-bg-violet-600')}                                    
                                    type='submit'
                                >
                                    {isLoadingForm ? 'Saving...' : mode === 'edit' ? 'Edit' : ' Create'} Event

                                </button>

                            </form>
                        </div >
                    </main>
                </section>
            )}
        </div>
    );
};

export default EventForm;