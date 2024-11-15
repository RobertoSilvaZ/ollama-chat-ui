import { useState } from 'react';
import Upscaler from 'upscaler';
import { toast } from 'react-hot-toast';
import { db } from '../db';

const MAX_TEXTURE_SIZE = 16384; // Maximum WebGL texture size supported by most GPUs

export function useImageUpscale() {
    const [isUpscaling, setIsUpscaling] = useState(false);
    const upscaler = new Upscaler();

    const getMaxAllowedScale = (width: number, height: number) => {
        const maxDimension = Math.max(width, height);
        const maxScale = Math.floor(MAX_TEXTURE_SIZE / maxDimension);
        return Math.min(4, maxScale); // Cap at 4x upscaling
    };

    const upscaleImage = async (imageId: number, imageData: string, scale: number) => {
        setIsUpscaling(true);
        const toastId = toast.loading('Upscaling image...');

        try {
            // Load image to get dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageData;
            });

            // Validate scale factor
            const maxScale = getMaxAllowedScale(img.width, img.height);
            if (scale > maxScale) {
                throw new Error(`Maximum allowed scale for this image is ${maxScale}x`);
            }

            // Convert base64 to blob URL for upscaler
            const response = await fetch(imageData);
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            // Configure upscaler
            const upscaledImage = await upscaler.upscale(imageUrl, {
                output: 'base64',
                patchSize: 512, // Smaller patch size to reduce memory usage
                progress: (progress: number) => {
                    toast.loading(`Upscaling: ${Math.round(progress * 100)}%`, { id: toastId });
                }
            });

            // Update the image in the database with upscale information
            await db.images.update(imageId, {
                imageData: upscaledImage,
                upscaleScale: scale
            });

            // Get the updated image from the database
            const updatedImage = await db.images.get(imageId);
            if (!updatedImage) {
                throw new Error('Failed to retrieve updated image');
            }

            // Cleanup
            URL.revokeObjectURL(imageUrl);

            toast.success(`Image upscaled by ${scale}x`, { id: toastId });
            return updatedImage;
        } catch (error) {
            console.error('Error upscaling image:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upscale image', { id: toastId });
            throw error;
        } finally {
            setIsUpscaling(false);
        }
    };

    return {
        upscaleImage,
        isUpscaling,
        getMaxAllowedScale
    };
}