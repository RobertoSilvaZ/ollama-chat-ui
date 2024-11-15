import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../db';
import type { GenerationParams, GeneratedImage } from '../db';

export function useImageGeneration() {
    const [pendingGenerations, setPendingGenerations] = useState(new Set<string>());

    const generateImage = async (prompt: string, params?: GenerationParams, existingImageId?: number) => {
        const generationId = `${Date.now()}-${Math.random()}`;
        setPendingGenerations(prev => new Set(prev).add(generationId));

        const toastId = toast.loading('Generating image...', {
            style: { maxWidth: '500px' }
        });

        try {
            // Always generate a new seed for regeneration
            const newSeed = Math.floor(Math.random() * 2147483647);
            const finalParams = {
                ...params,
                seed: existingImageId ? newSeed : (params?.seed || newSeed)
            };

            const response = await fetch(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: finalParams
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const blob = await response.blob();
            const reader = new FileReader();

            return new Promise<GeneratedImage>((resolve, reject) => {
                reader.onloadend = async () => {
                    try {
                        const base64data = reader.result as string;
                        const imageData = {
                            prompt,
                            imageData: base64data,
                            createdAt: new Date(),
                            parameters: finalParams
                        };

                        if (existingImageId) {
                            await db.images.update(existingImageId, imageData);
                            const updatedImage = await db.images.get(existingImageId);
                            if (updatedImage) {
                                resolve(updatedImage);
                            } else {
                                reject(new Error('Failed to retrieve updated image'));
                            }
                        } else {
                            const id = await db.images.add(imageData);
                            const newImage = await db.images.get(id);
                            if (newImage) {
                                resolve(newImage);
                            } else {
                                reject(new Error('Failed to retrieve new image'));
                            }
                        }

                        toast.success(existingImageId ? 'Image regenerated successfully' : 'Image generated successfully', {
                            id: toastId,
                            style: { maxWidth: '500px' }
                        });
                    } catch (error) {
                        reject(error);
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Failed to read image data'));
                };

                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to generate image',
                {
                    id: toastId,
                    style: { maxWidth: '500px' }
                }
            );
            throw error;
        } finally {
            setPendingGenerations(prev => {
                const next = new Set(prev);
                next.delete(generationId);
                return next;
            });
        }
    };

    return {
        generateImage,
        hasPendingGenerations: pendingGenerations.size > 0
    };
}