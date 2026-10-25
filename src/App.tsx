/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  ChatMessage,
  AssistantMode,
  AttachmentFile,
  TaskItem,
  NoteItem,
  UserPreferences,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadTasks,
  saveTasks,
  loadNotes,
  saveNotes,
  loadPreferences,
  savePreferences,
  exportConversationToMarkdown,
  exportConversationToJSON,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { DocumentModal } from './components/DocumentModal';
import { ProductivityDashboard } from './components/ProductivityDashboard';
import { MemoryModal } from './components/MemoryModal';

export default function App() {
  // Load persistent state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = loadConversations();
    if (saved.length > 0) return saved;

    // Default introductory conversation
    const initialConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Welcome to NOVA AI',
      mode: 'general',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: true,
      messages: [
        {
          id: 'welcome-1',
          role: 'assistant',
          content: `### Welcome to NOVA AI — Your Personal AI Productivity Platform ✨

I am NOVA, an intelligent assistant built with 10 dedicated operational modes, real-time Google Search grounding, multi-document intelligence, and an isolated coding sandbox.

#### What you can explore:
- **10 Intelligent Modes**: Switch between *Coding*, *Research*, *Writing*, *Document*, *Learning*, *Data*, *Productivity*, *Creative*, and *Personal* assistants.
- **Bilingual Mastery**: Converse fluently in English, বাংলা (Bengali), or mixed language queries.
- **Deep Document Intelligence**: Upload PDFs, CSVs, TXT, or images to analyze metrics, parse tables, and cross-compare documents.
- **Coding Workspace**: Generate, debug, download, and test JavaScript/HTML right inside an isolated sandbox runner.
- **Tasks & Notes**: Convert conversational action items into actionable tasks with a single click.

How can I assist you today?`,
          timestamp: Date.now(),
          mode: 'general',
        },
      ],
    };
    return [initialConv];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const savedId = loadActiveConversationId();
    if (savedId) return savedId;
    return conversations[0]?.id || null;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(loadTasks);
  const [notes, setNotes] = useState<NoteItem[]>(loadNotes);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [activeMode, setActiveMode] = useState<AssistantMode>(preferences.defaultMode || 'general');

  // UI state
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals state
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState('');
  const [sandboxLang, setSandboxLang] = useState('javascript');

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [productivityOpen, setProductivityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0] || null;

  // Persist state changes
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    savePreferences(preferences);
    // Apply theme
    if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [preferences]);

  // Keep activeMode synchronized when switching conversations
  useEffect(() => {
    if (activeConversation) {
      setActiveMode(activeConversation.mode);
    }
  }, [activeConversation?.id]);

  // Handle New Chat
  const handleNewChat = (mode?: AssistantMode) => {
    const targetMode = mode || preferences.defaultMode || 'general';
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      mode: targetMode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setActiveMode(targetMode);
  };

  // Switch Conversation
  const handleSelectConversation = (id: string) => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setActiveId(id);
    const target = conversations.find((c) => c.id === id);
    if (target) {
      setActiveMode(target.mode);
    }
  };

  // Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Switch Mode for Current Chat
  const handleChangeMode = (mode: AssistantMode) => {
    setActiveMode(mode);
    if (activeId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, mode, updatedAt: Date.now() } : c))
      );
    }
  };

  // Send Message with Real-Time Streaming
  const handleSendMessage = async (
    content: string,
    attachments: AttachmentFile[] = [],
    enableSearch: boolean = false
  ) => {
    if (!content && attachments.length === 0) return;

    let targetConvId = activeId;
    let currentConv = conversations.find((c) => c.id === targetConvId);

    // If no active conversation, create one
    if (!currentConv) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: content.slice(0, 40) || 'New Conversation',
        mode: activeMode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
      targetConvId = newConv.id;
      currentConv = newConv;
    } else if (currentConv.messages.length === 0 && content) {
      // Auto-title conversation on first message
      currentConv.title = content.slice(0, 42) + (content.length > 42 ? '...' : '');
    }

    const userMsgId = `msg-${Date.now()}-user`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: Date.now(),
      mode: activeMode,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMsgId = `msg-${Date.now()}-assistant`;
    const assistantMessagePlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: activeMode,
      isStreaming: true,
    };

    const updatedMessages = [...currentConv.messages, userMessage, assistantMessagePlaceholder];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: [...currentConv.messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode: activeMode,
          enableSearch,
          tone: preferences.tone,
          customInstruction: preferences.customMemory,
          temperature: preferences.temperature,
          attachments: attachments.map((a) => ({
            name: a.name,
            mimeType: a.mimeType,
            data: a.data,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported.');

      const decoder = new TextDecoder();
      let streamedContent = '';
      let collectedSources: any[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.text) {
                streamedContent += data.text;
                // Update message in state
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === targetConvId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMsgId
                              ? { ...m, content: streamedContent, isStreaming: true }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }

              if (data.sources) {
                collectedSources = data.sources;
              }

              if (data.error) {
                streamedContent += `\n\n*(Error: ${data.error})*`;
              }
            } catch (err) {
              // Ignore partial JSON chunk errors
            }
          }
        }
      }

      // Mark streaming complete
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: streamedContent,
                        sources: collectedSources.length > 0 ? collectedSources : undefined,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream cancelled by user');
      } else {
        console.error('Chat error:', err);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content:
                            m.content ||
                            `⚠️ **NOVA AI Notice**: ${err.message || 'Connection interrupted. Please verify your GEMINI_API_KEY in the Secrets panel.'}`,
                          isStreaming: false,
                          error: err.message,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Regenerate Response
  const handleRegenerateMessage = (msgId: string) => {
    if (!activeConversation) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    // Find previous user message
    const previousUserMsg = activeConversation.messages
      .slice(0, msgIndex)
      .reverse()
      .find((m) => m.role === 'user');

    if (!previousUserMsg) return;

    // Remove assistant message and trigger re-send
    const prunedMessages = activeConversation.messages.slice(0, msgIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: prunedMessages } : c
      )
    );

    handleSendMessage(
      previousUserMsg.content,
      previousUserMsg.attachments || [],
      activeMode === 'research'
    );
  };

  // Edit Message
  const handleEditMessage = (msgId: string, newContent: string) => {
    if (!activeConversation) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    // Truncate from this message onward
    const prunedMessages = activeConversation.messages.slice(0, msgIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: prunedMessages } : c
      )
    );

    handleSendMessage(newContent, [], activeMode === 'research');
  };

  // Tasks Management Handlers
  const handleAddTask = (title: string, priority: 'low' | 'medium' | 'high', category?: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Notes Management Handlers
  const handleAddNote = (title: string, content: string, tags: string[]) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title,
      content,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleUpdateNote = (id: string, title: string, content: string, tags: string[]) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, content, tags, updatedAt: Date.now() } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Gather all active documents in current conversation
  const currentConversationDocuments = React.useMemo(() => {
    if (!activeConversation) return [];
    const docs: AttachmentFile[] = [];
    activeConversation.messages.forEach((m) => {
      if (m.attachments) {
        m.attachments.forEach((a) => {
          if (!docs.some((d) => d.id === a.id)) {
            docs.push(a);
          }
        });
      }
    });
    return docs;
  }, [activeConversation]);

  // Language toggle
  const handleToggleLanguage = () => {
    const current = preferences.preferredLanguage;
    const next = current === 'en' ? 'bn' : current === 'bn' ? 'bilingual' : 'en';
    setPreferences((prev) => ({ ...prev, preferredLanguage: next }));
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const next = preferences.theme === 'dark' ? 'light' : 'dark';
    setPreferences((prev) => ({ ...prev, theme: next }));
  };

  // Tone update
  const handleChangeTone = (tone: UserPreferences['tone']) => {
    setPreferences((prev) => ({ ...prev, tone }));
  };

  // Export handlers
  const handleExportConversation = (conv: Conversation, format: 'md' | 'json') => {
    if (format === 'md') {
      exportConversationToMarkdown(conv);
    } else {
      exportConversationToJSON(conv);
    }
  };

  const handleExportAllData = () => {
    const fullBackup = {
      conversations,
      tasks,
      notes,
      preferences,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova_ai_complete_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setConversations([]);
    setTasks([]);
    setNotes([]);
    handleNewChat('general');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-100 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        onExportConversation={handleExportConversation}
        onOpenSandbox={() => {
          setSandboxCode(`// Welcome to NOVA Sandbox\nconsole.log("Hello from NOVA Sandbox!");\n\nconst calculate = (x, y) => x * y;\nconsole.log("Result:", calculate(6, 7));`);
          setSandboxLang('javascript');
          setSandboxOpen(true);
        }}
        onOpenDocuments={() => setDocumentModalOpen(true)}
        onOpenProductivity={() => setProductivityOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        pendingTasksCount={tasks.filter((t) => !t.completed).length}
        activeDocumentsCount={currentConversationDocuments.length}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        theme={preferences.theme === 'light' ? 'light' : 'dark'}
        onToggleTheme={handleToggleTheme}
        language={preferences.preferredLanguage}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <ChatView
          conversation={activeConversation}
          activeMode={activeMode}
          onChangeMode={handleChangeMode}
          onSendMessage={handleSendMessage}
          onRegenerateMessage={handleRegenerateMessage}
          onEditMessage={handleEditMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          onOpenSandbox={(code, lang) => {
            setSandboxCode(code || '');
            setSandboxLang(lang || 'javascript');
            setSandboxOpen(true);
          }}
          onOpenDocumentHub={(file) => {
            setDocumentModalOpen(true);
          }}
          onAddTaskFromChat={(title) => handleAddTask(title, 'medium')}
          onAddNoteFromChat={(title, content) => handleAddNote(title, content, [activeMode])}
          onExport={(format) => {
            if (activeConversation) {
              handleExportConversation(activeConversation, format);
            }
          }}
          userPreferences={preferences}
          onChangeTone={handleChangeTone}
        />
      </main>

      {/* Code Sandbox Modal */}
      <CodeSandboxModal
        isOpen={sandboxOpen}
        onClose={() => setSandboxOpen(false)}
        initialCode={sandboxCode}
        initialLanguage={sandboxLang}
      />

      {/* Document Intelligence Modal */}
      <DocumentModal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        files={currentConversationDocuments}
        onAskAboutDocument={(doc, prompt) => {
          handleSendMessage(prompt, [doc], false);
        }}
        onRemoveDocument={(id) => {
          // Remove from conversation messages if needed
        }}
      />

      {/* Tasks & Notes Productivity Dashboard */}
      <ProductivityDashboard
        isOpen={productivityOpen}
        onClose={() => setProductivityOpen(false)}
        tasks={tasks}
        notes={notes}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onClearCompletedTasks={handleClearCompletedTasks}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* AI Memory & Settings Modal */}
      <MemoryModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preferences={preferences}
        onSavePreferences={(newPrefs) => setPreferences(newPrefs)}
        onClearAllData={handleClearAllData}
        onExportAllData={handleExportAllData}
      />
    </div>
  );
}
