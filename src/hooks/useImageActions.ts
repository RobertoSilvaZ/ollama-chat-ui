import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db, type GeneratedImage } from '../db';
import { useImageGeneration } from './useImageGeneration';

export function useImageActions() {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { generateImage } = useImageGeneration();

    const handleDeleteImage = async (id: number) => {
        try {
            await db.images.delete(id);
            if (selectedImage?.id === id) {
                setSelectedImage(null);
                setIsDetailModalOpen(false);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleUpdateImage = async (id: number, prompt: string) => {
        try {
            await db.images.update(id, { prompt });
            toast.success('Image details updated successfully');
            setIsEditModalOpen(false);
            if (selectedImage?.id === id) {
                setSelectedImage({ ...selectedImage, prompt });
            }
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Failed to update image details');
        }
    };

    const handleDownload = async (image: GeneratedImage) => {
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

    const handleRegenerate = async (image: GeneratedImage) => {
        if (!image.id) return;
        try {
            const updatedImage = await generateImage(image.prompt, image.parameters, image.id);
            setSelectedImage(updatedImage);
        } catch (error) {
            console.error('Error regenerating image:', error);
        }
    };

    return {
        selectedImage,
        setSelectedImage,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        handleDeleteImage,
        handleUpdateImage,
        handleDownload,
        handleRegenerate
    };
}