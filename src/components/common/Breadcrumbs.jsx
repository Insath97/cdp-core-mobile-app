import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                <Home size={12} />
                Home
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={12} className="text-gray-300" />
                    {index === items.length - 1 ? (
                        <span className="text-gray-900 dark:text-white">{item.label}</span>
                    ) : (
                        <Link to={item.path} className="hover:text-primary-600 transition-colors">
                            {item.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
