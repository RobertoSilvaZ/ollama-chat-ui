import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db, type Topic } from '../db';

export function useTopics() {
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const createNewChat = async (selectedModel: string) => {
    try {
      const topic = {
        title: 'New Chat',
        createdAt: new Date(),
        modelId: selectedModel
      };
      const topicId = await db.topics.add(topic);
      return topicId;
    } catch (error) {
      toast.error('Failed to create new chat');
      return null;
    }
  };

  const deleteTopic = async (topicId: number) => {
    try {
      await db.messages.where('topicId').equals(topicId).delete();
      await db.topics.delete(topicId);
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const updateTopicTitle = async (topicId: number, newTitle: string) => {
    try {
      await db.topics.update(topicId, { title: newTitle });
      toast.success('Chat title updated');
    } catch (error) {
      toast.error('Failed to update chat title');
    }
  };

  return {
    editingTopic,
    setEditingTopic,
    createNewChat,
    deleteTopic,
    updateTopicTitle
  };
}