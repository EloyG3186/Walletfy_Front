import { Outlet } from "react-router-dom";
import React from 'react';
import MyContext from '@context/index';
import Navbar from './Navbar';

const Layout = () => {

    const { schema, toggleSchema } = React.useContext(MyContext);

    return (
        <div className={` cd-min-h-screen cd-transition-colors cd-duration-500 ${schema === 'dark' ? 'dark cd-bg-zinc-800' : 'cd-bg-white'}`}>
            {/* Reemplazar el header por el componente Navbar */}
            <Navbar toggleSchema={toggleSchema} schema={schema} />
            <div className="cd-pt-16">
                <Outlet />
                </div>
        </div>
    );
};

export default Layout;