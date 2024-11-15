import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';

interface ImageDetailHeaderProps {
    onBack: () => void;
    showZoom: boolean;
    onToggleZoom: () => void;
}

export function ImageDetailHeader({ onBack, showZoom, onToggleZoom }: ImageDetailHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
                <ChevronLeft size={20} />
                Back to Gallery
            </button>
            <button
                onClick={onToggleZoom}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showZoom
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
            >
                <Search size={16} />
                {showZoom ? 'Disable Zoom' : 'Enable Zoom'}
            </button>
        </div>
    );
}