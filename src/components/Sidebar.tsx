import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Code2,
  FileText,
  CheckSquare,
  Brain,
  Download,
  Moon,
  Sun,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Conversation, AssistantMode } from '../types';
import { ASSISTANT_MODES } from '../constants/modes';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: (mode?: AssistantMode) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onExportConversation: (conv: Conversation, format: 'md' | 'json') => void;
  onOpenSandbox: () => void;
  onOpenDocuments: () => void;
  onOpenProductivity: () => void;
  onOpenSettings: () => void;
  pendingTasksCount: number;
  activeDocumentsCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  language: 'en' | 'bn' | 'bilingual';
  onToggleLanguage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onTogglePin,
  onExportConversation,
  onOpenSandbox,
  onOpenDocuments,
  onOpenProductivity,
  onOpenSettings,
  pendingTasksCount,
  activeDocumentsCount,
  isOpen,
  onToggleOpen,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMode = selectedModeFilter === 'all' || c.mode === selectedModeFilter;
    return matchesSearch && matchesMode;
  });

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const recentConversations = filteredConversations.filter((c) => !c.isPinned);

  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={onToggleOpen}
          className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white shadow-lg hover:border-neutral-700 transition-all flex items-center justify-center"
          title="Open sidebar"
        >
          <ChevronRight className="w-5 h-5 text-amber-400" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 md:w-80 h-screen bg-neutral-950 border-r border-neutral-800/80 flex flex-col z-30 select-none text-neutral-200 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4 fill-neutral-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-neutral-100 font-sans">
                NOVA AI
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">Personal Assistant & Intellect</p>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => onNewChat()}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-semibold text-xs md:text-sm shadow-md shadow-amber-500/10 transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Search & Mode Filter */}
      <div className="px-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none text-[11px]">
          <button
            onClick={() => setSelectedModeFilter('all')}
            className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedModeFilter === 'all'
                ? 'bg-neutral-800 text-amber-400 font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            All Modes
          </button>
          {ASSISTANT_MODES.slice(0, 5).map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModeFilter(m.id)}
              className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedModeFilter === m.id
                  ? 'bg-neutral-800 text-amber-400 font-medium'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 px-2 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-amber-400/80">
              <Pin className="w-3 h-3 rotate-45" />
              <span>Pinned</span>
            </div>
            <div className="space-y-1">
              {pinnedConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeId}
                  isEditing={conv.id === editingId}
                  editTitle={editTitle}
                  onSetEditTitle={setEditTitle}
                  onSelect={() => onSelectConversation(conv.id)}
                  onStartRename={(e) => handleStartRename(conv, e)}
                  onSaveRename={(e) => handleSaveRename(conv.id, e)}
                  onCancelRename={() => setEditingId(null)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    onTogglePin(conv.id);
                  }}
                  onExport={(e, fmt) => {
                    e.stopPropagation();
                    onExportConversation(conv, fmt);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
            Recent Chats
          </div>

          {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500">
              <MessageSquare className="w-5 h-5 mx-auto mb-1.5 opacity-30" />
              <p>No conversations found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeId}
                  isEditing={conv.id === editingId}
                  editTitle={editTitle}
                  onSetEditTitle={setEditTitle}
                  onSelect={() => onSelectConversation(conv.id)}
                  onStartRename={(e) => handleStartRename(conv, e)}
                  onSaveRename={(e) => handleSaveRename(conv.id, e)}
                  onCancelRename={() => setEditingId(null)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    onTogglePin(conv.id);
                  }}
                  onExport={(e, fmt) => {
                    e.stopPropagation();
                    onExportConversation(conv, fmt);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Tools Nav */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40 space-y-1">
        <button
          onClick={onOpenSandbox}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Code Workspace</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
            Sandbox
          </span>
        </button>

        <button
          onClick={onOpenDocuments}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Document Hub</span>
          </div>
          {activeDocumentsCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
              {activeDocumentsCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenProductivity}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Tasks & Notes</span>
          </div>
          {pendingTasksCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>AI Memory & Settings</span>
          </div>
        </button>
      </div>

      {/* Footer Controls */}
      <div className="px-3 py-2.5 border-t border-neutral-800/80 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
        <button
          onClick={onToggleLanguage}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize">{language === 'bn' ? 'বাংলা' : language === 'bilingual' ? 'EN/বাং' : 'English'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

// Sub-component for individual conversation items with hover actions
interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onSetEditTitle: (val: string) => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e?: React.MouseEvent | React.FormEvent) => void;
  onCancelRename: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent, format: 'md' | 'json') => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  isEditing,
  editTitle,
  onSetEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDelete,
  onTogglePin,
  onExport,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-all ${
        isActive
          ? 'bg-neutral-800 text-neutral-100 font-medium border border-neutral-700/80'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1 pr-1">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`}
        />

        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveRename();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1 flex-1"
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onSetEditTitle(e.target.value)}
              autoFocus
              className="w-full bg-neutral-950 border border-amber-500/60 rounded px-1.5 py-0.5 text-xs text-neutral-100 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-400 hover:text-emerald-300"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onCancelRename}
              className="p-1 text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <span className="truncate flex-1">{conv.title}</span>
        )}
      </div>

      {/* Hover action buttons */}
      {!isEditing && (
        <div className="hidden group-hover:flex items-center space-x-1 text-neutral-400 shrink-0">
          <button
            onClick={onTogglePin}
            className={`p-1 hover:text-amber-400 transition-colors ${
              conv.isPinned ? 'text-amber-400' : ''
            }`}
            title={conv.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={onStartRename}
            className="p-1 hover:text-neutral-200 transition-colors"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => onExport(e, 'md')}
            className="p-1 hover:text-neutral-200 transition-colors"
            title="Export Markdown"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:text-red-400 transition-colors"
            title="Delete conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
