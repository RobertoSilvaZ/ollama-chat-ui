import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Send, Loader2, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { db } from './db';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ModelSelector } from './components/ModelSelector';
import { BotProfileModal, type BotProfile } from './components/BotProfileModal';
import { useModels } from './hooks/useModels';
import { useChat } from './hooks/useChat';
import { useTopics } from './hooks/useTopics';

const DEFAULT_BOT_PROFILE: BotProfile = {
  systemPrompt: "You are an AI assistant specialized in helping users craft effective prompts for AI image generation. Help users understand and utilize various aspects like composition, style, lighting, mood, and technical parameters to create detailed and creative image prompts.",
  temperature: 0.7
};

function App() {
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [botProfile, setBotProfile] = useState<BotProfile>(DEFAULT_BOT_PROFILE);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { models, selectedModel, setSelectedModel } = useModels();
  const { isLoading, sendMessage } = useChat(currentTopicId, selectedModel);
  const { editingTopic, setEditingTopic, createNewChat, deleteTopic, updateTopicTitle } = useTopics();

  const messages = useLiveQuery(
    () => currentTopicId ? 
      db.messages.where('topicId').equals(currentTopicId).toArray() :
      Promise.resolve([]),
    [currentTopicId]
  );

  const currentTopic = useLiveQuery(
    () => currentTopicId ?
      db.topics.get(currentTopicId) :
      Promise.resolve(null),
    [currentTopicId]
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleNewChat = async () => {
    const topicId = await createNewChat(selectedModel);
    if (topicId) setCurrentTopicId(topicId);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const content = input;
    setInput('');
    await sendMessage(content, messages, botProfile);
  };

  const handleResend = (message: Message) => {
    sendMessage(message.content, messages, botProfile);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      <BotProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={botProfile}
        onSave={setBotProfile}
      />
      <Sidebar
        currentTopicId={currentTopicId}
        onTopicSelect={setCurrentTopicId}
        onNewChat={handleNewChat}
        editingTopic={editingTopic}
        setEditingTopic={setEditingTopic}
        onDeleteTopic={deleteTopic}
        onUpdateTopicTitle={updateTopicTitle}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {currentTopic?.title || 'Select or start a new chat'}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Bot Settings"
            >
              <Settings size={20} />
            </button>
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
          {messages?.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onDelete={message.id ? () => db.messages.delete(message.id!) : undefined}
              onResend={message.isUser ? () => handleResend(message) : undefined}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-gray-400">
              <Loader2 className="animate-spin" size={20} />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
          <div className="flex gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="flex-1 bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || !currentTopicId || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[60px]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;