import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Download, Copy, Check, Search, RefreshCw, Loader2, ArrowUpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, type GeneratedImage } from '../db';
import { ZoomBox } from './ZoomBox';
import { EditImageModal } from './EditImageModal';
import { useImageUpscale } from '../hooks/useImageUpscale';

interface ImageDimensions {
    width: number;
    height: number;
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

export function ImageDetail() {
    const { imageId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState<GeneratedImage | null>(null);
    const [copied, setCopied] = useState(false);
    const [showZoom, setShowZoom] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedScale, setSelectedScale] = useState(2);
    const { upscaleImage, isUpscaling, getMaxAllowedScale } = useImageUpscale();
    const [maxScale, setMaxScale] = useState(2);
    const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const loadImage = async () => {
            if (!imageId) return;
            const loadedImage = await db.images.get(parseInt(imageId));
            if (loadedImage) {
                setImage(loadedImage);
            } else {
                navigate('/gallery');
                toast.error('Image not found');
            }
        };
        loadImage();
    }, [imageId, navigate]);

    useEffect(() => {
        if (!image?.imageData) return;

        const updateDimensions = () => {
            const img = new Image();
            img.onload = () => {
                const dims = { width: img.width, height: img.height };
                setDimensions(dims);

                // Only set original dimensions if not upscaled
                if (!image.upscaleScale) {
                    setOriginalDimensions(dims);
                }

                const maxAllowedScale = getMaxAllowedScale(img.width, img.height);
                setMaxScale(maxAllowedScale);
                setSelectedScale(Math.min(2, maxAllowedScale));
            };
            img.src = image.imageData;
        };

        updateDimensions();
    }, [image?.imageData, image?.upscaleScale, getMaxAllowedScale]);

    if (!image) return null;

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        toast.success('Prompt copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (confirmDelete) {
            await db.images.delete(image.id!);
            navigate('/gallery');
            toast.success('Image deleted successfully');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(image.imageData);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-image-${image.parameters?.seed || image.id}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Image downloaded successfully');
        } catch (error) {
            console.error('Error downloading image:', error);
            toast.error('Failed to download image');
        }
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_HUGGINGFACE_API_URL}`, {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: image.prompt,
                    parameters: image.parameters
                }),
            });

            if (!response.ok) throw new Error(await response.text());

            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                await db.images.update(image.id!, {
                    imageData: base64data,
                    parameters: {
                        ...image.parameters!,
                        seed: Math.floor(Math.random() * 2147483647)
                    }
                });
                const updatedImage = await db.images.get(image.id!);
                if (updatedImage) setImage(updatedImage);
                toast.success('Image regenerated successfully');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error regenerating image:', error);
            toast.error('Failed to regenerate image');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleUpscale = async () => {
        if (!image.id || !dimensions) return;

        try {
            if (!originalDimensions) {
                setOriginalDimensions(dimensions);
            }

            const updatedImage = await upscaleImage(image.id, image.imageData, selectedScale);
            setImage(updatedImage);

            const img = new Image();
            img.onload = () => {
                setDimensions({
                    width: img.width,
                    height: img.height
                });
            };
            img.src = updatedImage.imageData;
        } catch (error) {
            console.error('Error upscaling image:', error);
        }
    };

    const handleUpdateImage = async (prompt: string) => {
        try {
            await db.images.update(image.id!, { prompt });
            const updatedImage = await db.images.get(image.id!);
            if (updatedImage) {
                setImage(updatedImage);
                toast.success('Image details updated successfully');
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Failed to update image details');
        }
    };

    const isUpscaled = image.upscaleScale !== undefined;

    return (
        <div className="min-h-screen bg-gray-900">
            <EditImageModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                image={image}
                onUpdate={handleUpdateImage}
            />

            <header className="bg-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/gallery')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-white">
                        Image Detail
                        {isUpscaled && (
                            <span className="ml-2 text-sm bg-indigo-600 px-2 py-1 rounded">
                                {image.upscaleScale}x Upscaled
                            </span>
                        )}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <ActionButton
                        icon={<Search size={20} />}
                        label={showZoom ? 'Disable zoom' : 'Enable zoom'}
                        onClick={() => setShowZoom(!showZoom)}
                        className={`${showZoom ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        disabled={isRegenerating || isUpscaling}
                    />
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:flex-1">
                        <div className="bg-gray-800 rounded-lg p-2 relative">
                            <img
                                ref={imageRef}
                                src={image.imageData}
                                alt={image.prompt}
                                className={`w-full rounded-lg ${isRegenerating || isUpscaling ? 'opacity-50' : ''}`}
                            />
                            {(isRegenerating || isUpscaling) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                                </div>
                            )}
                            {showZoom && imageRef.current && !isRegenerating && !isUpscaling && (
                                <ZoomBox image={imageRef.current} />
                            )}
                        </div>
                        {dimensions && (
                            <div className="mt-2 text-center text-gray-400">
                                Current size: {dimensions.width} × {dimensions.height}px
                                {isUpscaled && originalDimensions && (
                                    <span className="ml-2">
                                        (Original: {originalDimensions.width} × {originalDimensions.height}px)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="lg:w-96">
                        <div className="sticky top-24">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-white">Prompt</h3>
                                <ActionButton
                                    icon={copied ? <Check size={16} /> : <Copy size={16} />}
                                    label="Copy prompt"
                                    onClick={handleCopyPrompt}
                                    className="text-gray-400 hover:text-white"
                                    disabled={isRegenerating || isUpscaling}
                                />
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

                            {!isUpscaled && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Upscale Settings</h3>
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={selectedScale}
                                            onChange={(e) => setSelectedScale(Number(e.target.value))}
                                            className="bg-gray-700 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                                            disabled={isRegenerating || isUpscaling || maxScale < 2}
                                        >
                                            {[...Array(maxScale - 1)].map((_, i) => (
                                                <option key={i + 2} value={i + 2}>
                                                    {i + 2}x Upscale
                                                </option>
                                            ))}
                                        </select>
                                        {maxScale < 2 && (
                                            <p className="text-yellow-500 text-sm">
                                                Image is too large to upscale further
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-4">
                                {!isUpscaled && (
                                    <>
                                        <ActionButton
                                            icon={<RefreshCw size={24} className={isRegenerating ? 'animate-spin' : ''} />}
                                            label="Regenerate"
                                            onClick={handleRegenerate}
                                            className="bg-purple-600 text-white"
                                            disabled={isRegenerating || isUpscaling}
                                        />
                                        <ActionButton
                                            icon={<ArrowUpCircle size={24} className={isUpscaling ? 'animate-spin' : ''} />}
                                            label="Upscale"
                                            onClick={handleUpscale}
                                            className="bg-indigo-600 text-white"
                                            disabled={isRegenerating || isUpscaling || maxScale < 2}
                                        />
                                    </>
                                )}
                                <ActionButton
                                    icon={<Download size={24} />}
                                    label="Download"
                                    onClick={handleDownload}
                                    className="bg-green-600 text-white"
                                    disabled={isRegenerating || isUpscaling}
                                />
                                {!isUpscaled && (
                                    <ActionButton
                                        icon={<Pencil size={24} />}
                                        label="Edit"
                                        onClick={() => {
                                            setIsEditModalOpen(true);
                                            toast.success('Editing image details');
                                        }}
                                        className="bg-blue-600 text-white"
                                        disabled={isRegenerating || isUpscaling}
                                    />
                                )}
                                <ActionButton
                                    icon={<Trash2 size={24} />}
                                    label="Delete"
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white"
                                    disabled={isRegenerating || isUpscaling}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}