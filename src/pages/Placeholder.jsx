import React from 'react';
import { useLocation } from 'react-router-dom';

const Placeholder = () => {
    const location = useLocation();
    const pageName = location.pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Page';

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{pageName} Under Construction</h2>
            <p className="text-gray-500 max-w-md">
                This page is part of the system requirements but has not been implemented in this initial design phase.
            </p>
        </div>
    );
};

export default Placeholder;
