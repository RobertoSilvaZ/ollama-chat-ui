import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Loader2 } from 'lucide-react';
import { db, type GenerationParams } from '../db';
import { CreateImageModal } from './CreateImageModal';
import { ImageDetailModal } from './ImageDetailModal';
import { EditImageModal } from './EditImageModal';
import { ImageCard } from './ImageCard';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useImageActions } from '../hooks/useImageActions';

export function Gallery() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { isGenerating, generateImage } = useImageGeneration();
    const {
        selectedImage,
        setSelectedImage,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        handleDeleteImage,
        handleUpdateImage,
        handleDownload
    } = useImageActions();

    const images = useLiveQuery(
        () => db.images.orderBy('createdAt').reverse().toArray(),
        []
    );

    const handleGenerate = async (prompt: string, params?: GenerationParams) => {
        const success = await generateImage(prompt, params);
        if (success) {
            setIsCreateModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <CreateImageModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
            />

            {selectedImage && (
                <>
                    <ImageDetailModal
                        isOpen={isDetailModalOpen}
                        onClose={() => {
                            setIsDetailModalOpen(false);
                            setSelectedImage(null);
                        }}
                        image={selectedImage}
                        onEdit={() => {
                            setIsDetailModalOpen(false);
                            setIsEditModalOpen(true);
                        }}
                        onDelete={() => handleDeleteImage(selectedImage.id!)}
                        onDownload={() => handleDownload(selectedImage)}
                    />

                    <EditImageModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedImage(null);
                        }}
                        image={selectedImage}
                        onUpdate={(prompt) => handleUpdateImage(selectedImage.id!, prompt)}
                    />
                </>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery</h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Create
                    </button>
                </div>

                {isGenerating && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4">
                            <Loader2 size={40} className="text-blue-500 animate-spin" />
                            <p className="text-white text-lg">Generating image...</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images?.map((image) => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            onView={() => {
                                setSelectedImage(image);
                                setIsDetailModalOpen(true);
                            }}
                            onEdit={() => {
                                setSelectedImage(image);
                                setIsEditModalOpen(true);
                            }}
                            onDelete={() => handleDeleteImage(image.id!)}
                            onDownload={() => handleDownload(image)}
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