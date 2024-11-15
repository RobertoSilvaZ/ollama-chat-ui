import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db, type Topic } from '../db';

export function useTopics() {
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const createNewChat = async (selectedModel: string): Promise<number | null> => {
    try {
      const topic = {
        title: 'New Chat',
        createdAt: new Date(),
        modelId: selectedModel
      };

      const topicId = await db.topics.add(topic);
      return typeof topicId === 'number' ? topicId : null;
    } catch (error) {
      console.error('Error creating new chat:', error);
      throw error;
    }
  };

  const deleteTopic = async (topicId: number) => {
    try {
      await db.transaction('rw', db.topics, db.messages, async () => {
        await db.messages.where('topicId').equals(topicId).delete();
        await db.topics.delete(topicId);
      });
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  };

  const updateTopicTitle = async (topicId: number, newTitle: string) => {
    try {
      await db.topics.update(topicId, { title: newTitle });
    } catch (error) {
      console.error('Error updating topic title:', error);
      throw error;
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