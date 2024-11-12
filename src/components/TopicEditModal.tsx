import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TopicEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  onSave: (newTitle: string) => void;
}

export function TopicEditModal({ isOpen, onClose, initialTitle, onSave }: TopicEditModalProps) {
  const [title, setTitle] = useState(initialTitle);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
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
        
        <h2 className="text-xl font-bold mb-4 text-white">Edit Chat Title</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="Enter chat title..."
              autoFocus
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
              disabled={!title.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}