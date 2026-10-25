export type AssistantMode =
  | 'general'
  | 'coding'
  | 'research'
  | 'writing'
  | 'document'
  | 'learning'
  | 'data'
  | 'productivity'
  | 'creative'
  | 'personal';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode: AssistantMode;
  sources?: GroundingSource[];
  attachments?: AttachmentFile[];
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: AssistantMode;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  createdAt: number;
  completedAt?: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  userName: string;
  preferredLanguage: 'en' | 'bn' | 'bilingual';
  tone: 'balanced' | 'concise' | 'in-depth' | 'academic' | 'friendly';
  defaultMode: AssistantMode;
  temperature: number;
  enableSearchByDefault: boolean;
  voiceName: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
  customMemory: string;
  theme: 'dark' | 'light' | 'system';
}

export interface ModeMetadata {
  id: AssistantMode;
  name: string;
  nameBn: string;
  tagline: string;
  description: string;
  icon: string;
  badge: string;
  capabilities: string[];
  starterPrompts: {
    en: string;
    bn: string;
  }[];
}
