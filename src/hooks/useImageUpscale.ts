import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../db';

export function useImageUpscale() {
    const [isUpscaling, setIsUpscaling] = useState(false);

    const getMaxAllowedScale = (width: number, height: number): number => {
        // Definimos los límites de escala
        const MIN_SCALE = 2;
        const MAX_SCALE = 4;

        // Si la imagen es muy pequeña, permitimos escalar hasta 4x
        if (width <= 512 && height <= 512) {
            return MAX_SCALE; // Imágenes pequeñas: hasta 4x
        }

        // Si la imagen es mediana, permitimos escalar hasta 3x
        if (width <= 1024 && height <= 1024) {
            return 3;
        }

        // Para imágenes más grandes, solo permitimos 2x
        return MIN_SCALE;
    };

    /**
     * Escala una imagen utilizando `<canvas>` y actualiza la base de datos.
     */
    const upscaleImage = async (imageId: number, originalImageData: string, scale: number = 2) => {
        if (scale < 2 || scale > 4) {
            throw new Error('Scale must be between 2 and 4');
        }

        setIsUpscaling(true);
        const toastId = toast.loading('Upscaling image...');

        try {
            // Create a canvas to upscale the image
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = originalImageData;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Set canvas size to the upscaled dimensions
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Use better image scaling algorithm
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw the image at the new scale
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convertir el canvas a formato PNG de máxima calidad
            const upscaledData = canvas.toDataURL('image/png', 1.0);

            // Actualizar la base de datos con la imagen escalada
            await db.images.update(imageId, {
                imageData: upscaledData,
                upscaleScale: scale
            });

            // Recuperar la imagen actualizada
            const updatedImage = await db.images.get(imageId);
            if (!updatedImage) {
                throw new Error('Failed to retrieve updated image');
            }

            toast.success(`Image upscaled successfully to ${scale}x`, { id: toastId });
            return updatedImage;

        } catch (error) {
            console.error('Error upscaling image:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to upscale image',
                { id: toastId }
            );
            throw error;
        } finally {
            setIsUpscaling(false);
        }
    };

    return {
        upscaleImage,
        isUpscaling,
        getMaxAllowedScale,
    };
}
