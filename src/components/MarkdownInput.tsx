import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Edit3, Eye, Maximize2, Minimize2, Code, Loader2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';

interface MarkdownInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel?: () => void;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export const MarkdownInput = forwardRef<HTMLTextAreaElement, MarkdownInputProps>(({
    value,
    onChange,
    onSubmit,
    onCancel,
    placeholder,
    isLoading,
    disabled
}, ref) => {
    const [isPreview, setIsPreview] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Forward the internal ref to the parent component
    useImperativeHandle(ref, () => textareaRef.current!, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            onSubmit();
        } else if (e.key === 'Escape' && isLoading && onCancel) {
            onCancel();
        }
    };

    const formatAsCode = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        if (!selectedText) {
            toast.error('Please select some text to format as code');
            return;
        }

        const hasLineBreaks = selectedText.includes('\n');
        const language = 'typescript';
        const formattedText = hasLineBreaks
            ? `\`\`\`${language}\n${selectedText}\n\`\`\``
            : `\`${selectedText}\``;

        const newValue = value.substring(0, start) + formattedText + value.substring(end);
        onChange(newValue);
        toast.success('Text formatted as code');

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        });
    };

    const PreviewModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h3 className="text-lg font-medium text-white">Preview</h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Minimize2 size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value || '*Preview empty*'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`relative bg-gray-800 rounded-lg ${disabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between p-2 border-b border-gray-700">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className={`p-1.5 rounded-md transition-colors ${isPreview ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            title={isPreview ? 'Switch to edit mode' : 'Switch to preview mode'}
                            disabled={disabled}
                        >
                            {isPreview ? <Eye size={18} /> : <Edit3 size={18} />}
                        </button>
                        {!isPreview && (
                            <button
                                onClick={formatAsCode}
                                className="p-1.5 rounded-md text-gray-400 hover:text-white transition-colors"
                                title="Format as code"
                                disabled={disabled}
                            >
                                <Code size={18} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading && onCancel && (
                            <button
                                onClick={onCancel}
                                className="p-1.5 text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                                title="Cancel request"
                                disabled={disabled}
                            >
                                <XCircle size={18} />
                                <span className="text-sm">Cancel</span>
                            </button>
                        )}
                        {isLoading && (
                            <Loader2 size={18} className="text-blue-500 animate-spin" />
                        )}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-1.5 text-gray-400 hover:text-white transition-colors"
                            title="Open in modal"
                            disabled={disabled}
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>

                <div>
                    {isPreview ? (
                        <div className="p-4 prose dark:prose-invert max-w-none h-full max-h-[300px] overflow-y-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value || '*Preview empty*'}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="w-full min-h-[100px] max-h-[300px] bg-transparent text-white p-4 resize-y focus:outline-none disabled:cursor-not-allowed"
                                disabled={disabled || isLoading}
                            />
                            {isLoading && (
                                <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
                                    <Loader2 size={24} className="text-blue-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!isPreview && !disabled && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
                        {isLoading && onCancel ? ' | Esc to cancel' : ''}
                    </div>
                )}
            </div>

            <PreviewModal />
        </>
    );
});

MarkdownInput.displayName = 'MarkdownInput';