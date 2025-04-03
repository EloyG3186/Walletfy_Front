import { Outlet } from "react-router-dom";

import React from 'react';

import MyContext from '@context/index';

const Layout = () => {

    const { schema, toggleSchema } = React.useContext(MyContext);

    return (
        <div className={` cd-min-h-screen cd-transition-colors cd-duration-500 ${schema === 'dark' ? 'dark cd-bg-zinc-800' : 'cd-bg-white'}`}>
            <header className={
                
                "cd-fixed cd-top-0 cd-left-0 cd-right-0 cd-w-full " +
                "dark:cd-bg-zinc-800 cd-bg-white " +
                "cd-font-sans cd-header cd-flex " +
                "cd-items-center cd-justify-between " +
                "cd-p-2 sm:cd-p-4 cd-shadow-md"
            } >
                <a href="" className="cd-text-xl sm:cd-text-2xl md:cd-text-3xl cd-font-bold dark:cd-text-white cd-text-black cd-m-1 sm:cd-m-3">Wallet
                    <span className="cd-text-violet-700">fy</span>
                </a>
                <button
                    className="cd-p-2 sm:cd-p-3 cd-rounded-md cd-shadow-lg cd-bg-gray-200 hover:cd-bg-gray-300 cd-mx-2 sm:cd-mx-6 dark:cd-bg-zinc-700 dark:hover:cd-bg-gray-500 cd-transition-colors cd-duration-500"
                    onClick={toggleSchema}
                >
                    {schema === 'light' ? '🌒' : '🌞'}
                </button>
            </header >
            <div className="cd-pt-16">
                <Outlet />
                </div>
        </div>
    );
};

export default Layout;