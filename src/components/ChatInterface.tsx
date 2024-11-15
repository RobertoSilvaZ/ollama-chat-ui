import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings, MessageSquarePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [botProfile, setBotProfile] = useState<BotProfile>(DEFAULT_BOT_PROFILE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Set initial topic ID from URL params
  useEffect(() => {
    if (topicId) {
      const numericTopicId = parseInt(topicId, 10);
      if (!isNaN(numericTopicId)) {
        setCurrentTopicId(numericTopicId);
      }
    } else {
      setCurrentTopicId(null);
    }
  }, [topicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const newTopicId = await createNewChat(selectedModel);
      if (newTopicId !== null) {
        // Update state and navigate
        setCurrentTopicId(newTopicId);
        navigate(`/chat/${newTopicId}`);

        // Focus input after navigation
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);

        toast.success('New chat created');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const handleTopicSelect = (topicId: number) => {
    setCurrentTopicId(topicId);
    navigate(`/chat/${topicId}`);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleDeleteTopic = async (topicId: number) => {
    try {
      await deleteTopic(topicId);

      // Get remaining topics after deletion
      const remainingTopics = await db.topics.orderBy('createdAt').reverse().toArray();

      // If the deleted topic was the current one, redirect to the most recent topic or clear the view
      if (currentTopicId === topicId) {
        const mostRecentTopic = remainingTopics[0];
        if (mostRecentTopic?.id) {
          setCurrentTopicId(mostRecentTopic.id);
          navigate(`/chat/${mostRecentTopic.id}`);
        } else {
          setCurrentTopicId(null);
          navigate('/chat');
        }
      }

      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    await db.messages.delete(messageId);
    toast.success('Message deleted');
  };

  const handleResendMessage = async (message: Message) => {
    if (isLoading) return;
    const promise = sendMessage(message.content, messages, botProfile);
    toast.promise(promise, {
      loading: 'Sending message...',
      success: 'Message sent',
      error: 'Failed to send message'
    });
  };

  const handleEditMessage = (content: string) => {
    setInput(prev => prev + (prev ? '\n\n' : '') + content);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    toast.success('Message copied to input');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentTopicId) return;

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
          {currentTopicId ? (
            messages?.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onDelete={message.id ? () => handleDeleteMessage(message.id!) : undefined}
                onResend={message.isUser ? () => handleResendMessage(message) : undefined}
                onEdit={message.isUser ? handleEditMessage : undefined}
                profileTitle={botProfile.title}
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <MessageSquarePlus size={48} className="mb-4" />
              <p className="text-xl font-medium mb-2">No chat selected</p>
              <p className="mb-4">Create a new chat or select an existing one to start the conversation</p>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Chat
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <MarkdownInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSendMessage}
            onCancel={isLoading ? cancelRequest : undefined}
            placeholder={currentTopicId ? "Type your message... (Markdown supported)" : "Select or create a chat to start the conversation"}
            isLoading={isLoading}
            disabled={!currentTopicId}
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