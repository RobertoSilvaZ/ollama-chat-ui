import React from 'react';
import { X } from 'lucide-react';

interface BotProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BotProfile;
  onSave: (profile: BotProfile) => void;
}

export interface BotProfile {
  systemPrompt: string;
  temperature: number;
}

export function BotProfileModal({ isOpen, onClose, profile, onSave }: BotProfileModalProps) {
  const [formData, setFormData] = React.useState(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-white">Bot Profile Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              System Prompt
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 min-h-[100px]"
              placeholder="Enter system prompt..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Temperature ({formData.temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full"
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
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}