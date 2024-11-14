import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { db, type Message } from '../db';
import { ChatMessage } from './ChatMessage';
import { Sidebar } from './Sidebar';
import { ModelSelector } from './ModelSelector';
import { ThemeToggle } from './ThemeToggle';
import { BotProfileModal } from './BotProfileModal';
import { MarkdownInput } from './MarkdownInput';
import { useModels } from '../hooks/useModels';
import { useChat } from '../hooks/useChat';
import { useTopics } from '../hooks/useTopics';
import type { BotProfile } from './BotProfileModal';

const DEFAULT_BOT_PROFILE: BotProfile = {
  systemPrompt: "You are a helpful AI assistant.",
  temperature: 0.7
};

export function ChatInterface() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(
    topicId ? parseInt(topicId, 10) : null
  );
  const [input, setInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [botProfile, setBotProfile] = useState<BotProfile>(DEFAULT_BOT_PROFILE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { models, selectedModel, setSelectedModel } = useModels();
  const { editingTopic, setEditingTopic, createNewChat, deleteTopic, updateTopicTitle } = useTopics();
  const { isLoading, sendMessage, cancelRequest } = useChat(currentTopicId, selectedModel);

  const messages = useLiveQuery<Message[]>(
    () => currentTopicId ?
      db.messages.where('topicId').equals(currentTopicId).toArray() :
      Promise.resolve([]),
    [currentTopicId]
  ) ?? [];

  const topics = useLiveQuery(
    () => db.topics.orderBy('createdAt').reverse().toArray(),
    []
  );

  useEffect(() => {
    if (topicId) {
      const numericTopicId = parseInt(topicId, 10);
      setCurrentTopicId(numericTopicId);
    }
  }, [topicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = async () => {
    const newTopicId = await createNewChat(selectedModel);
    if (newTopicId !== null) {
      setCurrentTopicId(newTopicId);
      navigate(`/chat/${newTopicId}`);
      toast.success('New chat created');
    }
  };

  const handleTopicSelect = (topicId: number) => {
    setCurrentTopicId(topicId);
    navigate(`/chat/${topicId}`);
  };

  const handleDeleteTopic = async (topicId: number) => {
    await deleteTopic(topicId);
    if (currentTopicId === topicId) {
      const firstTopic = topics?.[0];
      if (firstTopic?.id) {
        handleTopicSelect(firstTopic.id);
      } else {
        navigate('/chat');
        setCurrentTopicId(null);
      }
    }
    toast.success('Chat deleted');
  };

  const handleDeleteMessage = async (messageId: number) => {
    await db.messages.delete(messageId);
    toast.success('Message deleted');
  };

  const handleResendMessage = async (message: Message) => {
    if (isLoading) return;
    await sendMessage(message.content, messages, botProfile);
    toast.success('Message resent');
  };

  const handleEditMessage = (content: string) => {
    setInput(prev => prev + (prev ? '\n\n' : '') + content);
    toast.success('Message copied to input');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const promise = sendMessage(input, messages, botProfile);
    toast.promise(promise, {
      loading: 'Sending message...',
      success: 'Message sent',
      error: 'Failed to send message'
    });
    setInput('');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
      <Sidebar
        currentTopicId={currentTopicId}
        onTopicSelect={handleTopicSelect}
        onNewChat={handleNewChat}
        editingTopic={editingTopic}
        setEditingTopic={setEditingTopic}
        onDeleteTopic={handleDeleteTopic}
        onUpdateTopicTitle={updateTopicTitle}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 p-4 flex items-center justify-between">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Bot settings"
            >
              <Settings size={20} />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages?.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onDelete={message.id ? () => handleDeleteMessage(message.id!) : undefined}
              onResend={message.isUser ? () => handleResendMessage(message) : undefined}
              onEdit={message.isUser ? handleEditMessage : undefined}
              profileTitle={botProfile.title}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <MarkdownInput
            value={input}
            onChange={setInput}
            onSubmit={handleSendMessage}
            onCancel={isLoading ? cancelRequest : undefined}
            placeholder="Type your message... (Markdown supported)"
            isLoading={isLoading}
          />
        </div>
      </div>

      <BotProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={botProfile}
        onSave={setBotProfile}
      />
    </div>
  );
}