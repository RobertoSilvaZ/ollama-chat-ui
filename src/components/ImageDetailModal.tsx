import React, { useState, useRef, useEffect } from 'react';
import { X, Pencil, Trash2, Download, Copy, Check, Search, RefreshCw, Loader2 } from 'lucide-react';
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
    onRegenerate: () => Promise<void>;
    onDuplicate: () => void;
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

function ActionButton({ icon, label, onClick, className = '', disabled = false }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative p-3 rounded-lg transition-all duration-200 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
                }`}
            title={label}
        >
            {icon}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
            </span>
        </button>
    );
}

export function ImageDetailModal({
    isOpen,
    onClose,
    image,
    onEdit,
    onDelete,
    onDownload,
    onRegenerate,
    onDuplicate
}: ImageDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const [showZoom, setShowZoom] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const [currentImage, setCurrentImage] = useState<GeneratedImage>(image);

    useEffect(() => {
        setCurrentImage(image);
    }, [image]);

    if (!isOpen) return null;

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(currentImage.prompt);
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

    const handleRegenerate = async () => {
        try {
            setIsRegenerating(true);
            await onRegenerate();
            toast.success('Image regenerated successfully');
        } catch (error) {
            toast.error('Failed to regenerate image');
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Image Detail</h2>
                    <div className="flex items-center gap-2">
                        <ActionButton
                            icon={<Search size={20} />}
                            label={showZoom ? 'Disable zoom' : 'Enable zoom'}
                            onClick={() => setShowZoom(!showZoom)}
                            className={`${showZoom ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            disabled={isRegenerating}
                        />
                        <ActionButton
                            icon={<X size={20} />}
                            label="Close"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                            disabled={isRegenerating}
                        />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:flex-1">
                            <div className="bg-gray-900 rounded-lg p-2 relative">
                                <img
                                    ref={imageRef}
                                    src={currentImage.imageData}
                                    alt={currentImage.prompt}
                                    className={`w-full rounded-lg ${isRegenerating ? 'opacity-50' : ''}`}
                                />
                                {isRegenerating && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 size={48} className="text-blue-500 animate-spin" />
                                    </div>
                                )}
                                {showZoom && imageRef.current && !isRegenerating && (
                                    <ZoomBox image={imageRef.current} />
                                )}
                            </div>
                        </div>
                        <div className="lg:w-96">
                            <div className="sticky top-0">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-white">Prompt</h3>
                                    <ActionButton
                                        icon={copied ? <Check size={16} /> : <Copy size={16} />}
                                        label="Copy prompt"
                                        onClick={handleCopyPrompt}
                                        className="text-gray-400 hover:text-white"
                                        disabled={isRegenerating}
                                    />
                                </div>
                                <p className="text-gray-300 mb-6 break-words">{currentImage.prompt}</p>

                                <h3 className="text-lg font-semibold text-white mb-2">Created</h3>
                                <p className="text-gray-300 mb-6">
                                    {new Date(currentImage.createdAt).toLocaleString()}
                                </p>

                                {currentImage.parameters && (
                                    <>
                                        <h3 className="text-lg font-semibold text-white mb-2">Parameters</h3>
                                        <div className="text-gray-300 mb-6 space-y-2">
                                            <p>Guidance Scale: {currentImage.parameters.guidance_scale}</p>
                                            <p>Inference Steps: {currentImage.parameters.num_inference_steps}</p>
                                            <p>Size: {currentImage.parameters?.width}x{currentImage.parameters?.height}</p>
                                            {currentImage.parameters.negative_prompt && currentImage.parameters.negative_prompt.length > 0 && (
                                                <p>Negative Prompt: {currentImage.parameters.negative_prompt.join(', ')}</p>
                                            )}
                                            <p>Seed: {currentImage.parameters.seed}</p>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-center gap-4 mt-8">
                                    <ActionButton
                                        icon={<RefreshCw size={24} className={isRegenerating ? 'animate-spin' : ''} />}
                                        label="Regenerate"
                                        onClick={handleRegenerate}
                                        className="bg-purple-600 text-white"
                                        disabled={isRegenerating}
                                    />
                                    <ActionButton
                                        icon={<Download size={24} />}
                                        label="Download"
                                        onClick={onDownload}
                                        className="bg-green-600 text-white"
                                        disabled={isRegenerating}
                                    />
                                    <ActionButton
                                        icon={<Copy size={24} />}
                                        label="Duplicate"
                                        onClick={onDuplicate}
                                        className="bg-yellow-600 text-white"
                                        disabled={isRegenerating}
                                    />
                                    <ActionButton
                                        icon={<Pencil size={24} />}
                                        label="Edit"
                                        onClick={() => {
                                            onEdit();
                                            toast.success('Editing image details');
                                        }}
                                        className="bg-blue-600 text-white"
                                        disabled={isRegenerating}
                                    />
                                    <ActionButton
                                        icon={<Trash2 size={24} />}
                                        label="Delete"
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white"
                                        disabled={isRegenerating}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}