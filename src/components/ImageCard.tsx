import React from 'react';
import { Pencil, Trash2, Download, Hash, Copy, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GeneratedImage } from '../db';

interface ImageCardProps {
    image: GeneratedImage;
    onEdit: () => void;
    onDelete: () => void;
    onDownload: () => void;
    onDuplicate: () => void;
}

export function ImageCard({ image, onEdit, onDelete, onDownload, onDuplicate }: ImageCardProps) {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg group relative">
            <div
                onClick={() => navigate(`/gallery/${image.id}`)}
                className="cursor-pointer"
            >
                <img
                    src={image.imageData}
                    alt={image.prompt}
                    className="w-full h-64 object-cover transition-transform hover:scale-105"
                />
            </div>
            <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {image.prompt}
                </p>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                        {image.parameters?.seed && (
                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
                                <Hash size={12} />
                                {image.parameters.seed}
                            </div>
                        )}
                        {image.upscaleScale && (
                            <div className="flex items-center gap-1 text-indigo-400 text-xs">
                                <ArrowUpCircle size={12} />
                                {image.upscaleScale}x
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onDownload}
                    className="p-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80"
                    title="Download image"
                >
                    <Download size={16} />
                </button>
                <button
                    onClick={onDuplicate}
                    className="p-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80"
                    title="Duplicate image"
                >
                    <Copy size={16} />
                </button>
                {!image.upscaleScale && (
                    <button
                        onClick={onEdit}
                        className="p-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80"
                        title="Edit image"
                    >
                        <Pencil size={16} />
                    </button>
                )}
                <button
                    onClick={onDelete}
                    className="p-2 bg-gray-800/80 text-white rounded-lg hover:bg-red-600/80"
                    title="Delete image"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}