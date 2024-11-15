import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { GeneratedImage } from '../db';

interface EditImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: GeneratedImage;
    onUpdate: (prompt: string) => void;
}

export function EditImageModal({ isOpen, onClose, image, onUpdate }: EditImageModalProps) {
    const [prompt, setPrompt] = useState(image.prompt);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onUpdate(prompt.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Edit Image</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 min-h-[100px]"
                            placeholder="Enter your image prompt..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            disabled={!prompt.trim()}
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}