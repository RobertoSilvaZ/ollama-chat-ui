import React, { useState, useRef, useEffect } from 'react';
import { X, Pencil, Trash2, Download, Copy, Check, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { GeneratedImage } from '../db';
import { ZoomBox } from './ZoomBox';

interface ImageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: GeneratedImage;
    onEdit: () => void;
    onDelete: () => void;
    onDownload: () => void;
}

export function ImageDetailModal({ isOpen, onClose, image, onEdit, onDelete, onDownload }: ImageDetailModalProps) {
    const [copied, setCopied] = React.useState(false);
    const [showZoom, setShowZoom] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    if (!isOpen) return null;

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        toast.success('Prompt copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (confirmDelete) {
            onDelete();
            toast.success('Image deleted successfully');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Image Detail</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowZoom(!showZoom)}
                            className={`p-2 rounded-lg transition-colors ${showZoom
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            title={showZoom ? 'Disable zoom' : 'Enable zoom'}
                        >
                            <Search size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:flex-1">
                            <div className="bg-gray-900 rounded-lg p-2 relative">
                                <img
                                    ref={imageRef}
                                    src={image.imageData}
                                    alt={image.prompt}
                                    className="w-full rounded-lg"
                                />
                                {showZoom && imageRef.current && (
                                    <ZoomBox image={imageRef.current} />
                                )}
                            </div>
                        </div>
                        <div className="lg:w-96">
                            <div className="sticky top-0">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-white">Prompt</h3>
                                    <button
                                        onClick={handleCopyPrompt}
                                        className="p-1.5 text-gray-400 hover:text-white transition-colors"
                                        title="Copy prompt"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p className="text-gray-300 mb-6 break-words">{image.prompt}</p>

                                <h3 className="text-lg font-semibold text-white mb-2">Created</h3>
                                <p className="text-gray-300 mb-6">
                                    {new Date(image.createdAt).toLocaleString()}
                                </p>

                                {image.parameters && (
                                    <>
                                        <h3 className="text-lg font-semibold text-white mb-2">Parameters</h3>
                                        <div className="text-gray-300 mb-6 space-y-2">
                                            <p>Guidance Scale: {image.parameters.guidance_scale}</p>
                                            <p>Inference Steps: {image.parameters.num_inference_steps}</p>
                                            <p>Size: {image.parameters?.width}x{image.parameters?.height}</p>
                                            {image.parameters.negative_prompt && image.parameters.negative_prompt.length > 0 && (
                                                <p>Negative Prompt: {image.parameters.negative_prompt.join(', ')}</p>
                                            )}
                                            <p>Seed: {image.parameters.seed}</p>
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col gap-3 mt-8">
                                    <button
                                        onClick={onDownload}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full"
                                    >
                                        <Download size={18} />
                                        Download Image
                                    </button>
                                    <button
                                        onClick={() => {
                                            onEdit();
                                            toast.success('Editing image details');
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
                                    >
                                        <Pencil size={18} />
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
                                    >
                                        <Trash2 size={18} />
                                        Delete Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}