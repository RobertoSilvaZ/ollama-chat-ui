import React, { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Send, Loader2, Settings } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../db";
import { Sidebar } from "./Sidebar";
import { ChatMessage } from "./ChatMessage";
import { ModelSelector } from "./ModelSelector";
import { BotProfileModal, type BotProfile } from "./BotProfileModal";
import { useModels } from "../hooks/useModels";
import { useChat } from "../hooks/useChat";
import { useTopics } from "../hooks/useTopics";
import { PREDEFINED_PROFILES } from "../constants/profiles";
import { NotFound } from "./NotFound";

const DEFAULT_BOT_PROFILE: BotProfile = PREDEFINED_PROFILES[0];

export function ChatInterface() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(
    topicId ? parseInt(topicId, 10) : null
  );
  const [input, setInput] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [botProfile, setBotProfile] = useState<BotProfile>(DEFAULT_BOT_PROFILE);
  const [topicExists, setTopicExists] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { models, selectedModel, setSelectedModel } = useModels();
  const { isLoading, sendMessage } = useChat(currentTopicId, selectedModel);
  const {
    editingTopic,
    setEditingTopic,
    createNewChat,
    deleteTopic,
    updateTopicTitle,
  } = useTopics();

  const messages = useLiveQuery(
    () =>
      currentTopicId
        ? db.messages.where("topicId").equals(currentTopicId).toArray()
        : Promise.resolve([]),
    [currentTopicId]
  );

  const currentTopic = useLiveQuery(
    () =>
      currentTopicId ? db.topics.get(currentTopicId) : Promise.resolve(null),
    [currentTopicId]
  );

  useEffect(() => {
    if (topicId) {
      const checkTopic = async () => {
        const topic = await db.topics.get(parseInt(topicId, 10));
        setTopicExists(!!topic);
      };
      checkTopic();
    }
  }, [topicId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleNewChat = async () => {
    const newTopicId = await createNewChat(selectedModel);
    if (newTopicId) {
      setCurrentTopicId(newTopicId);
      navigate(`/chat/${newTopicId}`);
    }
  };

  const handleTopicSelect = (topicId: number) => {
    setCurrentTopicId(topicId);
    navigate(`/chat/${topicId}`);
  };

  const handleDeleteTopic = async (topicId: number) => {
    await deleteTopic(topicId);
    navigate("/chat");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input;
    setInput("");
    await sendMessage(content, messages, botProfile);
  };

  const handleResend = (message: Message) => {
    sendMessage(message.content, messages, botProfile);
  };

  if (topicId && !topicExists) {
    return <NotFound />;
  }

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
        onTopicSelect={handleTopicSelect}
        onNewChat={handleNewChat}
        editingTopic={editingTopic}
        setEditingTopic={setEditingTopic}
        onDeleteTopic={handleDeleteTopic}
        onUpdateTopicTitle={updateTopicTitle}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {currentTopic?.title || "Select or start a new chat"}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors group relative"
              title="Bot Settings"
            >
              <Settings size={20} />
              <span className="absolute right-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-sm px-2 py-1 rounded whitespace-nowrap">
                {botProfile.title || "Custom Profile"}
              </span>
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
              onDelete={
                message.id ? () => db.messages.delete(message.id!) : undefined
              }
              onResend={
                message.isUser ? () => handleResend(message) : undefined
              }
              profileTitle={!message.isUser ? botProfile.title : undefined}
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

        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-700"
        >
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
