import Dexie, { type Table } from 'dexie';

export interface Topic {
  id?: number;
  title: string;
  createdAt: Date;
  modelId: string;
}

export interface Message {
  id?: number;
  topicId: number;
  content: string;
  isUser: boolean;
  modelId: string;
  createdAt: Date;
}

export class ChatDatabase extends Dexie {
  topics!: Table<Topic>;
  messages!: Table<Message>;

  constructor() {
    super('ChatDatabase');
    this.version(1).stores({
      topics: '++id, title, createdAt, modelId',
      messages: '++id, topicId, content, isUser, modelId, createdAt',
    });
  }
}

export const db = new ChatDatabase();