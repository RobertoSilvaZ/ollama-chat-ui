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

export interface GenerationParams {
  guidance_scale?: number;
  negative_prompt?: string[];
  num_inference_steps?: number;
  width?: number;
  height?: number;
  scheduler?: string;
  seed?: number;
}

export interface GeneratedImage {
  id?: number;
  prompt: string;
  imageData: string;
  createdAt: Date;
  parameters?: GenerationParams;
  upscaleScale?: number; // Track if image was upscaled and by what factor
}

export class ChatDatabase extends Dexie {
  topics!: Table<Topic>;
  messages!: Table<Message>;
  images!: Table<GeneratedImage>;

  constructor() {
    super('ChatDatabase');
    this.version(3).stores({
      topics: '++id, title, createdAt, modelId',
      messages: '++id, topicId, content, isUser, modelId, createdAt',
      images: '++id, prompt, createdAt, upscaleScale'
    });
  }
}

export const db = new ChatDatabase();