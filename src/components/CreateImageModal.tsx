import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';
import { GenerationParams } from '../db';

interface CreateImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, params?: GenerationParams) => void;
    isGenerating: boolean;
}

export function CreateImageModal({ isOpen, onClose, onGenerate, isGenerating }: CreateImageModalProps) {
    const [prompt, setPrompt] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [params, setParams] = useState<GenerationParams>({
        guidance_scale: 7.5,
        num_inference_steps: 50,
        width: 512,
        height: 512,
        seed: Math.floor(Math.random() * 2147483647)
    });
    const [negativePrompt, setNegativePrompt] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isGenerating) {
            const finalParams = {
                ...params,
                negative_prompt: negativePrompt.trim() ? [negativePrompt.trim()] : undefined
            };
            onGenerate(prompt.trim(), finalParams);
            setPrompt('');
            setNegativePrompt('');
        }
    };

    const handleNewSeed = () => {
        setParams(prev => ({
            ...prev,
            seed: Math.floor(Math.random() * 2147483647)
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Create New Image</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={isGenerating}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 min-h-[200px]"
                            placeholder="Describe the image you want to generate..."
                            disabled={isGenerating}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white mb-4"
                    >
                        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        Advanced Settings
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Negative Prompt
                                </label>
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                    placeholder="Describe what you don't want in the image..."
                                    disabled={isGenerating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Guidance Scale ({params.guidance_scale})
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="0.5"
                                    value={params.guidance_scale}
                                    onChange={(e) => setParams(prev => ({
                                        ...prev,
                                        guidance_scale: parseFloat(e.target.value)
                                    }))}
                                    className="w-full"
                                    disabled={isGenerating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Inference Steps ({params.num_inference_steps})
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={params.num_inference_steps}
                                    onChange={(e) => setParams(prev => ({
                                        ...prev,
                                        num_inference_steps: parseInt(e.target.value)
                                    }))}
                                    className="w-full"
                                    disabled={isGenerating}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Width (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="256"
                                        max="2048"
                                        step="64"
                                        value={params.width}
                                        onChange={(e) => setParams(prev => ({
                                            ...prev,
                                            width: parseInt(e.target.value)
                                        }))}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                        disabled={isGenerating}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Height (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="256"
                                        max="2048"
                                        step="64"
                                        value={params.height}
                                        onChange={(e) => setParams(prev => ({
                                            ...prev,
                                            height: parseInt(e.target.value)
                                        }))}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-200">
                                        Seed
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleNewSeed}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        disabled={isGenerating}
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={params.seed}
                                    onChange={(e) => setParams(prev => ({
                                        ...prev,
                                        seed: parseInt(e.target.value)
                                    }))}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 hover:text-white"
                            disabled={isGenerating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={!prompt.trim() || isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}