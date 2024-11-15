import React from 'react';
import { Pencil, Trash2, Download, Copy, Check, RefreshCw, ArrowUpCircle } from 'lucide-react';
import type { GeneratedImage } from '../db';

interface ImageDetailActionsProps {
    image: GeneratedImage;
    isUpscaled: boolean;
    isRegenerating: boolean;
    isUpscaling: boolean;
    copied: boolean;
    selectedScale: number;
    maxScale: number;
    onCopyPrompt: () => void;
    onSetSelectedScale: (scale: number) => void;
    onRegenerateImage: () => void;
    onUpscale: () => void;
    onDownload: () => void;
    onDuplicate: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function ImageDetailActions({
    image,
    isUpscaled,
    isRegenerating,
    isUpscaling,
    copied,
    selectedScale,
    maxScale,
    onCopyPrompt,
    onSetSelectedScale,
    onRegenerateImage,
    onUpscale,
    onDownload,
    onDuplicate,
    onEdit,
    onDelete
}: ImageDetailActionsProps) {
    const scaleOptions = Array.from({ length: maxScale - 1 }, (_, i) => i + 2);
    const canUpscale = scaleOptions.length > 0 && !isUpscaled;

    const handleScaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newScale = parseInt(event.target.value, 10);
        if (!isNaN(newScale) && newScale >= 2 && newScale <= maxScale) {
            onSetSelectedScale(newScale);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Prompt
                        {isUpscaled && (
                            <span className="ml-2 text-sm bg-indigo-600 px-2 py-1 rounded text-white">
                                {image.upscaleScale}x Upscaled
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={onCopyPrompt}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Copy prompt"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{image.prompt}</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Created</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    {new Date(image.createdAt).toLocaleString()}
                </p>
            </div>

            {image.parameters && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Parameters</h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        <p>Guidance Scale: {image.parameters.guidance_scale}</p>
                        <p>Inference Steps: {image.parameters.num_inference_steps}</p>
                        <p>Size: {image.parameters.width}x{image.parameters.height}</p>
                        {image.parameters.negative_prompt && image.parameters.negative_prompt.length > 0 && (
                            <p>Negative Prompt: {image.parameters.negative_prompt.join(', ')}</p>
                        )}
                        <p>Seed: {image.parameters.seed}</p>
                    </div>
                </div>
            )}

            {!isUpscaled && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upscale</h3>
                    <div className="flex items-center gap-4">
                        {canUpscale ? (
                            <select
                                value={selectedScale}
                                onChange={handleScaleChange}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                                disabled={isRegenerating || isUpscaling}
                            >
                                {scaleOptions.map((scale) => (
                                    <option key={scale} value={scale}>
                                        {scale}x Upscale
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-yellow-500 text-sm">
                                Image is too large to upscale further
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4">
                {!isUpscaled && (
                    <>
                        <button
                            onClick={onRegenerateImage}
                            disabled={isRegenerating || isUpscaling}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            <RefreshCw size={20} className={isRegenerating ? 'animate-spin' : ''} />
                            Regenerate
                        </button>
                        {canUpscale && (
                            <button
                                onClick={onUpscale}
                                disabled={isRegenerating || isUpscaling}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <ArrowUpCircle size={20} className={isUpscaling ? 'animate-spin' : ''} />
                                Upscale {selectedScale}x
                            </button>
                        )}
                    </>
                )}
                <button
                    onClick={onDownload}
                    disabled={isRegenerating || isUpscaling}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <Download size={20} />
                    Download
                </button>
                <button
                    onClick={onDuplicate}
                    disabled={isRegenerating || isUpscaling}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                    <Copy size={20} />
                    Duplicate
                </button>
                {!isUpscaled && (
                    <button
                        onClick={onEdit}
                        disabled={isRegenerating || isUpscaling}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Pencil size={20} />
                        Edit
                    </button>
                )}
                <button
                    onClick={onDelete}
                    disabled={isRegenerating || isUpscaling}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                    <Trash2 size={20} />
                    Delete
                </button>
            </div>
        </div>
    );
}