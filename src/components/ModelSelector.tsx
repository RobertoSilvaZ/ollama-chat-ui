import React from 'react';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export function ModelSelector({ models, selectedModel, onModelSelect }: ModelSelectorProps) {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelSelect(e.target.value)}
      className="bg-gray-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
    >
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
}