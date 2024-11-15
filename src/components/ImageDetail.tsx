import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { db } from '../db';
import { EditImageModal } from './EditImageModal';
import { useImageActions } from '../hooks/useImageActions';
import { useImageUpscale } from '../hooks/useImageUpscale';
import { ZoomBox } from './ZoomBox';
import { ImageDetailHeader } from './ImageDetailHeader';
import { ImageDetailActions } from './ImageDetailActions';

interface ImageDimensions {
    width: number;
    height: number;
}

export function ImageDetail() {
    const { imageId } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showZoom, setShowZoom] = useState(false);
    const [selectedScale, setSelectedScale] = useState(2);
    const [maxScale, setMaxScale] = useState(2);
    const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const {
        handleDeleteImage,
        handleUpdateImage,
        handleDownload,
        handleRegenerate,
        handleDuplicate
    } = useImageActions();

    const { upscaleImage, isUpscaling, getMaxAllowedScale } = useImageUpscale();

    const image = useLiveQuery(
        async () => {
            if (!imageId) return null;
            const id = parseInt(imageId);
            if (isNaN(id)) return null;
            const img = await db.images.get(id);
            if (!img) {
                toast.error('Image not found');
                navigate('/gallery');
                return null;
            }
            return img;
        },
        [imageId, navigate]
    );

    useEffect(() => {
        if (!image?.imageData) return;

        const img = new Image();
        img.onload = () => {
            const dims = { width: img.width, height: img.height };
            setDimensions(dims);

            if (!image.upscaleScale) {
                setOriginalDimensions(dims);
            }

            const maxAllowedScale = getMaxAllowedScale(img.width, img.height);
            setMaxScale(maxAllowedScale);
            setSelectedScale(Math.min(2, maxAllowedScale));
        };
        img.src = image.imageData;
    }, [image?.imageData, image?.upscaleScale]);

    if (!image) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">Loading image...</span>
                </div>
            </div>
        );
    }

    const handleBack = () => navigate('/gallery');

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        toast.success('Prompt copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (confirmDelete) {
            try {
                await handleDeleteImage(image.id!);
                toast.success('Image deleted successfully');
                navigate('/gallery');
            } catch (error) {
                toast.error('Failed to delete image');
            }
        }
    };

    const handleUpscale = async () => {
        if (!image.id || !dimensions) return;

        try {
            if (!originalDimensions) {
                setOriginalDimensions(dimensions);
            }

            await upscaleImage(image.id, image.imageData, selectedScale);
        } catch (error) {
            console.error('Error upscaling image:', error);
        }
    };

    const handleRegenerateImage = async () => {
        if (!image.id) return;

        try {
            setIsRegenerating(true);
            await handleRegenerate(image);
            toast.success('Image regenerated successfully');
        } catch (error) {
            toast.error('Failed to regenerate image');
        } finally {
            setIsRegenerating(false);
        }
    };

    const isUpscaled = image.upscaleScale !== undefined;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <EditImageModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                image={image}
                onUpdate={(prompt) => handleUpdateImage(image.id!, prompt)}
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <ImageDetailHeader
                    onBack={handleBack}
                    showZoom={showZoom}
                    onToggleZoom={() => setShowZoom(!showZoom)}
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="lg:flex-1">
                                <div className="bg-gray-900 rounded-lg p-2 relative">
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
                                    <div className="mt-2 text-center text-gray-500 dark:text-gray-400">
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
                                <ImageDetailActions
                                    image={image}
                                    isUpscaled={isUpscaled}
                                    isRegenerating={isRegenerating}
                                    isUpscaling={isUpscaling}
                                    copied={copied}
                                    selectedScale={selectedScale}
                                    maxScale={maxScale}
                                    onCopyPrompt={handleCopyPrompt}
                                    onSetSelectedScale={setSelectedScale}
                                    onRegenerateImage={handleRegenerateImage}
                                    onUpscale={handleUpscale}
                                    onDownload={() => handleDownload(image)}
                                    onDuplicate={() => handleDuplicate(image)}
                                    onEdit={() => setIsEditModalOpen(true)}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}