import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Image } from 'lucide-react';

export function Navigation() {
    return (
        <nav className="w-16 bg-gray-800 min-h-screen flex flex-col items-center py-4">
            <NavLink
                to="/chat"
                className={({ isActive }) =>
                    `p-3 rounded-lg mb-2 ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`
                }
                title="Chat"
            >
                <MessageSquare size={24} />
            </NavLink>
            <NavLink
                to="/gallery"
                className={({ isActive }) =>
                    `p-3 rounded-lg mb-2 ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`
                }
                title="Gallery"
            >
                <Image size={24} />
            </NavLink>
        </nav>
    );
}