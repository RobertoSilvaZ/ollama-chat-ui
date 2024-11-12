import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function useModels() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_OLLAMA_API_URL}/api/tags`);
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        const modelNames = data.models?.map((m: any) => m.name) || [];
        if (modelNames.length === 0) throw new Error('No models available');
        setModels(modelNames);
        setSelectedModel(modelNames[0]);
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to fetch models. Please ensure Ollama is running.');
      }
    };

    fetchModels();
  }, []);

  return { models, selectedModel, setSelectedModel };
}