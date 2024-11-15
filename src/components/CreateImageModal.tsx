import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
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
        height: 512
        ,
        seed: Math.floor(Math.random() * 2147483647) // Using full 32-bit integer range
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt.trim(), params);
        }
    };

    const handleNegativePromptChange = (value: string) => {
        setParams(prev => ({
            ...prev,
            negative_prompt: value.split(',').map(p => p.trim()).filter(p => p)
        }));
    };

    const generateNewSeed = () => {
        setParams(prev => ({
            ...prev,
            seed: Math.floor(Math.random() * 2147483647)
        }));
    };

    const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
        const validValue = Math.min(2048, Math.max(256, Math.round(value / 64) * 64));
        setParams(prev => ({
            ...prev,
            [dimension]: validValue
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Generate Image</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={isGenerating}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 min-h-[100px]"
                            placeholder="Enter your image prompt..."
                            disabled={isGenerating}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white mb-4"
                    >
                        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        Advanced Parameters
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 mb-4">
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
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Higher values make the image more closely match the prompt, but may reduce quality
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Negative Prompt (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={params.negative_prompt?.join(', ')}
                                    onChange={(e) => handleNegativePromptChange(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                    placeholder="Enter negative prompts..."
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Specify what you don't want in the image
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Inference Steps ({params.num_inference_steps})
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={params.num_inference_steps}
                                    onChange={(e) => setParams(prev => ({
                                        ...prev,
                                        num_inference_steps: parseInt(e.target.value)
                                    }))}
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    More steps generally mean higher quality but slower generation
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Width (px)
                                    </label>
                                    <input
                                        type="number"
                                        value={params?.width}
                                        onChange={(e) => handleDimensionChange('width', parseInt(e.target.value))}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                        min="256"
                                        max="2048"
                                        step="64"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Height (px)
                                    </label>
                                    <input
                                        type="number"
                                        value={params?.height}
                                        onChange={(e) => handleDimensionChange('height', parseInt(e.target.value))}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                                        min="256"
                                        max="2048"
                                        step="64"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 col-span-2">
                                    Dimensions between 256px and 2048px, in multiples of 64px
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">
                                    Seed
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={params.seed}
                                        onChange={(e) => setParams(prev => ({
                                            ...prev,
                                            seed: parseInt(e.target.value)
                                        }))}
                                        className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2"
                                        min="0"
                                        max="2147483647"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateNewSeed}
                                        className="p-2 bg-gray-700 text-gray-300 hover:text-white rounded-lg"
                                        title="Generate new seed"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Use the same seed to reproduce similar images or generate variations
                                </p>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!prompt.trim() || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}