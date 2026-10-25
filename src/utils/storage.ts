import { Conversation, TaskItem, NoteItem, UserPreferences, ChatMessage } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'nova_ai_conversations',
  CURRENT_CONV_ID: 'nova_ai_active_conv_id',
  TASKS: 'nova_ai_tasks',
  NOTES: 'nova_ai_notes',
  PREFERENCES: 'nova_ai_preferences',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'Explorer',
  preferredLanguage: 'bilingual',
  tone: 'balanced',
  defaultMode: 'general',
  temperature: 0.7,
  enableSearchByDefault: false,
  voiceName: 'Kore',
  customMemory: 'Enjoys concise code explanations with clear types, structured markdown formatting, and supportive guidance.',
  theme: 'dark',
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load preferences from localStorage', e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences to localStorage', e);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load conversations from localStorage', e);
  }
  return [];
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations to localStorage', e);
  }
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CONV_ID);
  } catch (e) {
    return null;
  }
}

export function saveActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONV_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CONV_ID);
    }
  } catch (e) {
    console.error('Failed to save active conversation id', e);
  }
}

export function loadTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load tasks', e);
  }
  return [
    {
      id: 'task-1',
      title: 'Explore NOVA AI coding workspace & sandbox',
      completed: false,
      priority: 'high',
      category: 'Onboarding',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'task-2',
      title: 'Upload a PDF or CSV document for deep question answering',
      completed: false,
      priority: 'medium',
      category: 'Research',
      createdAt: Date.now() - 1800000,
    },
    {
      id: 'task-3',
      title: 'Try Research Assistant with live Google Search grounding',
      completed: true,
      priority: 'low',
      category: 'Discovery',
      createdAt: Date.now() - 7200000,
      completedAt: Date.now() - 600000,
    },
  ];
}

export function saveTasks(tasks: TaskItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load notes', e);
  }
  return [
    {
      id: 'note-1',
      title: 'Welcome to NOVA AI',
      content:
        'NOVA AI is designed with 10 intelligent assistant modes, real Gemini 3.8 Flash intelligence, Google Search grounding, document understanding, and code execution.',
      tags: ['Guide', 'Quickstart'],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
  ];
}

export function saveNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

// Conversation Export Utilities
export function exportConversationToMarkdown(conv: Conversation): void {
  const lines: string[] = [
    `# ${conv.title}`,
    `*Mode: ${conv.mode.toUpperCase()} | Created: ${new Date(conv.createdAt).toLocaleString()}*`,
    `---`,
    '',
  ];

  for (const msg of conv.messages) {
    const author = msg.role === 'user' ? '👤 User' : '✨ NOVA AI';
    lines.push(`### ${author} (${new Date(msg.timestamp).toLocaleTimeString()})`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');
    if (msg.sources && msg.sources.length > 0) {
      lines.push('**Sources Referenced:**');
      msg.sources.forEach((s) => lines.push(`- [${s.title}](${s.url})`));
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportConversationToJSON(conv: Conversation): void {
  const jsonStr = JSON.stringify(conv, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Extract tasks from markdown text
export function extractTasksFromText(text: string): string[] {
  const taskLines: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Matches: - [ ] task, * [ ] task, 1. [ ] task, or bullet with action items
    const checkboxMatch = trimmed.match(/^[-*+]\s*\[([ xX])\]\s*(.+)$/);
    if (checkboxMatch) {
      taskLines.push(checkboxMatch[2].trim());
      continue;
    }

    // Matches numbered steps like "1. Do X" or bullet items under task sections
    const stepMatch = trimmed.match(/^(\d+\.|\-|\*)\s+(Phase \d+:|Step \d+:|Task \d+:|Action:)?\s*(.+)$/i);
    if (stepMatch && (trimmed.toLowerCase().includes('task') || trimmed.toLowerCase().includes('step') || trimmed.toLowerCase().includes('implement') || trimmed.toLowerCase().includes('review') || trimmed.toLowerCase().includes('create'))) {
      const cleanTitle = stepMatch[3].trim().replace(/\*\*/g, '');
      if (cleanTitle.length > 5 && cleanTitle.length < 120) {
        taskLines.push(cleanTitle);
      }
    }
  }

  // Deduplicate and return up to 10
  return Array.from(new Set(taskLines)).slice(0, 10);
}
