import moment from "moment"
import { $ } from "@utils/styles";
import { FlowType, MONTHS } from "@customTypes/event"
import React from "react";
import { Tooltip as ReactTooltip } from 'react-tooltip';

type EventBalanceProps = {
    data: FlowType;
    index?: number;
    children?: React.ReactNode;
}

const EventBalance = (props: EventBalanceProps) => {
    console.log('EventBalance - props recibidos:', props);
    
    const { data } = props
    console.log('EventBalance - data:', data);
    
    const { id, events, income, expense, monthly, global } = data;
    console.log('EventBalance - id:', id, 'events:', events?.length, 'income:', income, 'expense:', expense);

    // Verificar que el id tenga el formato correcto (YYYY-MM)
    if (!id || id.length < 7) {
        console.error('EventBalance - Error: id no tiene el formato esperado:', id);
        return null;
    }
    
    const month = parseInt(id.substring(5, 7), 10);
    console.log('EventBalance - mes extraído:', month);

    return (

        <div
            className={$('cd-flex cd-rounded-xl cd-px-2 sm:cd-px-4 md:cd-px-8 cd-py-2 cd-flex-col cd-bg-gray-100 ',
                'dark:cd-bg-zinc-700 dark:cd-border dark:cd-border-gray-600 cd-shadow-2xl')}>

            <section className="cd-flex cd-justify-between cd-items-center cd-px-2 sm:cd-px-4 md:cd-px-[4rem] cd-py-[0.5rem]">

                <h2 className={$('cd-justify-center cd-text-center cd-text-base sm:cd-text-lg md:cd-text-xl cd-py-2 ',
                    'cd-text-zinc-800 cd-font-sans cd-font-semibold ',
                    'dark:cd-text-gray-300')}>
                    {MONTHS[month - 1]} {id.slice(0, 4)}</h2>
            </section>

            <div className="cd-border-b cd-border-gray-200  dark:cd-border-zinc-500"></div>

            <section>
                {events.map(event => (
                    <div
                        key={event.id}
                        className='cd-p-2 cd-rounded hover:cd-bg-slate-400 cd-transition-colors'
                        data-tooltip-id={`tooltip-${event.id}`}
                    >
                        <a href={`/events/form/${event.id}`}                        >

                            <div className='cd-flex cd-justify-between cd-items-center'>
                                <div className="cd-flex cd-flex-col cd-font-sans cd-text-gray-300 cd-text-sm sm:cd-text-base md:cd-text-lg">
                                    <span className=" cd-text-gray-700 dark:cd-text-gray-200 ">
                                        {event.name}
                                    </span>
                                    <span className='cd-pb-4 cd-text-gray-700 dark:cd-text-gray-200 '>
                                        {moment.unix(event.date).format('YYYY-MM-DD')}
                                    </span>
                                </div>
                                <div className='cd-text-right cd-flex cd-items-center'>
                                    <p className={`${event.type === 'income' ? 'cd-text-green-600' : 'cd-text-red-300'} cd-text-sm sm:cd-text-base md:cd-text-lg cd-text-right`}>
                                        ${event.amount.toFixed(2)}
                                    </p>
                                </div>

                            </div>
                            <div className="cd-border-b cd-border-gray-200 cd-w-full cd-h-[1px] cd-mb-[0.5rem] dark:cd-border-zinc-500">
                            </div>


                            <ReactTooltip id={`tooltip-${event.id}`} place="bottom-end">
                                <div className="cd-flex cd-flex-col cd-items-center">
                                    <p>{event.description}</p>
                                    {event.attachment &&
                                        <img
                                            src={event.attachment}
                                            alt="Event"
                                            className="cd-w-32 cd-h-32 cd-object-cover cd-mt-2"
                                        />
                                    }

                                </div>
                            </ReactTooltip>
                        </a>
                    </div>

                ))}
            </section>


            <footer className='cd-flex cd-flex-col cd-gap-y-[0.1rem] cd-pb-2'>

                <div className='cd-px-2 sm:cd-px-4 md:cd-px-[1rem] cd-pb-[1rem]'>

                    <div className='cd-flex cd-text-sm sm:cd-text-base md:cd-text-lg cd-flex-row cd-justify-between'>
                        <strong>Income:  </strong>
                        <p>
                            ${income.toFixed(2)}
                        </p>
                    </div>

                    <div className='cd-flex cd-text-sm sm:cd-text-base md:cd-text-lg cd-flex-row cd-justify-between'>
                        <strong>Expenses:  </strong>
                        <p>
                            ${expense.toFixed(2)}
                        </p>
                    </div>

                    <div className='cd-flex cd-text-sm sm:cd-text-base md:cd-text-lg cd-flex-row cd-justify-between'>
                        <strong>Monthly:  </strong>
                        <p >
                            ${monthly.toFixed(2)}
                        </p>
                    </div>

                    <div className='cd-flex cd-text-sm sm:cd-text-base md:cd-text-lg cd-flex-row cd-justify-between'>
                        <strong>Global:  </strong>
                        <p >
                            ${global.toFixed(2)}
                        </p>
                    </div>
                </div>
            </footer>
        </div>

    )

}

export default EventBalance;