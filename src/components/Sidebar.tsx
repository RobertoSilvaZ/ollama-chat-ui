import React, { useState } from 'react';
import { MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Topic } from '../db';
import { formatDistanceToNow } from 'date-fns';
import { TopicEditModal } from './TopicEditModal';

interface SidebarProps {
  currentTopicId: number | null;
  onTopicSelect: (topicId: number) => void;
  onNewChat: () => void;
  editingTopic: Topic | null;
  setEditingTopic: (topic: Topic | null) => void;
  onDeleteTopic: (topicId: number) => void;
  onUpdateTopicTitle: (topicId: number, newTitle: string) => void;
}

export function Sidebar({
  currentTopicId,
  onTopicSelect,
  onNewChat,
  editingTopic,
  setEditingTopic,
  onDeleteTopic,
  onUpdateTopicTitle
}: SidebarProps) {
  const [hoveredTopicId, setHoveredTopicId] = useState<number | null>(null);

  const topics = useLiveQuery(
    () => db.topics.orderBy('createdAt').reverse().toArray(),
    []
  );

  const handleUpdateTopicTitle = async (newTitle: string) => {
    if (!editingTopic?.id) return;
    await onUpdateTopicTitle(editingTopic.id, newTitle);
    setEditingTopic(null);
  };

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 h-screen flex flex-col border-r border-gray-200 dark:border-gray-700">
      <TopicEditModal
        isOpen={!!editingTopic}
        onClose={() => setEditingTopic(null)}
        initialTitle={editingTopic?.title || ''}
        onSave={handleUpdateTopicTitle}
      />

      <button
        onClick={onNewChat}
        className="m-2 p-3 flex items-center gap-2 text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <Plus size={20} />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {topics?.map((topic) => (
          <div
            key={topic.id}
            className={`relative group ${topic.id === currentTopicId ? 'bg-gray-200 dark:bg-gray-700' : ''
              }`}
            onMouseEnter={() => setHoveredTopicId(topic.id!)}
            onMouseLeave={() => setHoveredTopicId(null)}
          >
            <button
              onClick={() => topic.id && onTopicSelect(topic.id)}
              className="w-full p-3 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white text-left"
            >
              <MessageSquare size={20} />
              <div className="flex-1 overflow-hidden">
                <div className="truncate">{topic.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </div>
              </div>
            </button>

            {hoveredTopicId === topic.id && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setEditingTopic(topic)}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                  title="Edit chat title"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => topic.id && onDeleteTopic(topic.id)}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}