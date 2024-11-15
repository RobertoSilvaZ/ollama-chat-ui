import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../db';
import type { GenerationParams } from '../db';

export function useImageGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateImage = async (prompt: string, params?: GenerationParams) => {
        const toastId = toast.loading('Generating image...');
        setIsGenerating(true);

        try {
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
                        parameters: {
                            ...params,
                            seed: params?.seed || Math.floor(Math.random() * 2147483647)
                        }
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const blob = await response.blob();
            const reader = new FileReader();

            return new Promise((resolve) => {
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    await db.images.add({
                        prompt,
                        imageData: base64data,
                        createdAt: new Date(),
                        parameters: {
                            ...params,
                            seed: params?.seed || Math.floor(Math.random() * 2147483647)
                        }
                    });
                    toast.success('Image generated successfully', { id: toastId });
                    resolve(true);
                };

                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    return { isGenerating, generateImage };
}