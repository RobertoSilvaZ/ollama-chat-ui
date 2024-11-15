import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, type GenerationParams } from '../db';
import { CreateImageModal } from './CreateImageModal';
import { EditImageModal } from './EditImageModal';
import { ImageCard } from './ImageCard';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useImageActions } from '../hooks/useImageActions';

export function Gallery() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { generateImage, hasPendingGenerations } = useImageGeneration();
    const {
        selectedImage,
        setSelectedImage,
        isEditModalOpen,
        setIsEditModalOpen,
        handleDeleteImage,
        handleUpdateImage,
        handleDownload,
        handleDuplicate
    } = useImageActions();

    const images = useLiveQuery(
        () => db.images.orderBy('createdAt').reverse().toArray(),
        []
    );

    const handleGenerate = async (prompt: string, params?: GenerationParams) => {
        try {
            await generateImage(prompt, params);
            setIsCreateModalOpen(false);
            toast.success('Image generation started');
        } catch (error) {
            toast.error('Failed to start image generation');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await handleDeleteImage(id);
            toast.success('Image deleted successfully');
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <CreateImageModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onGenerate={handleGenerate}
                isGenerating={hasPendingGenerations}
            />

            {selectedImage && (
                <EditImageModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedImage(null);
                    }}
                    image={selectedImage}
                    onUpdate={(prompt) => handleUpdateImage(selectedImage.id!, prompt)}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery</h1>
                    <div className="flex items-center gap-4">
                        {hasPendingGenerations && (
                            <div className="flex items-center gap-2 text-blue-500">
                                <Loader2 size={20} className="animate-spin" />
                                <span>Generating...</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            disabled={hasPendingGenerations}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={20} />
                            Create
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images?.map((image) => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            onEdit={() => {
                                setSelectedImage(image);
                                setIsEditModalOpen(true);
                            }}
                            onDelete={() => handleDelete(image.id!)}
                            onDownload={() => handleDownload(image)}
                            onDuplicate={() => handleDuplicate(image)}
                        />
                    ))}
                </div>

                {images?.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
                        No images generated yet. Click the Create button to get started!
                    </div>
                )}
            </div>
        </div>
    );
}