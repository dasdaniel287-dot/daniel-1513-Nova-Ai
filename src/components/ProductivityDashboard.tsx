import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  FileEdit,
  Tag,
  Copy,
  Check,
  Search,
  Calendar,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { TaskItem, NoteItem } from '../types';

interface ProductivityDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  notes: NoteItem[];
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high', category?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompletedTasks: () => void;
  onAddNote: (title: string, content: string, tags: string[]) => void;
  onUpdateNote: (id: string, title: string, content: string, tags: string[]) => void;
  onDeleteNote: (id: string) => void;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({
  isOpen,
  onClose,
  tasks,
  notes,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompletedTasks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');

  // Task state
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('');

  // Note state
  const [noteSearch, setNoteSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority, newTaskCategory.trim() || undefined);
    setNewTaskTitle('');
  };

  const handleCreateOrUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    const tagsArray = newNoteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNoteId) {
      onUpdateNote(editingNoteId, newNoteTitle.trim() || 'Untitled Note', newNoteContent, tagsArray);
      setEditingNoteId(null);
    } else {
      onAddNote(newNoteTitle.trim() || 'Untitled Note', newNoteContent, tagsArray);
    }

    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
  };

  const handleStartEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNewNoteTags(note.tags.join(', '));
  };

  const handleCopyNote = (note: NoteItem) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  const filteredNotes = notes.filter((n) => {
    const q = noteSearch.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center space-x-3">
            <div className="flex bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/50">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks ({pendingCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'notes'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Notes & Scratchpad ({notes.length})</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === 'tasks' ? (
          <div className="flex-1 flex flex-col p-5 overflow-hidden">
            {/* New Task Form */}
            <form onSubmit={handleCreateTask} className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task or action item..."
                className="flex-1 min-w-[200px] bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <input
                type="text"
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                placeholder="Category (optional)"
                className="w-32 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </form>

            {/* Filter toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs text-neutral-400">
              <div className="flex space-x-2">
                {(['all', 'pending', 'completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`capitalize px-2.5 py-1 rounded-lg transition-colors ${
                      taskFilter === filter
                        ? 'bg-neutral-800 text-amber-400 font-medium'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {tasks.some((t) => t.completed) && (
                <button
                  onClick={onClearCompletedTasks}
                  className="text-neutral-500 hover:text-red-400 transition-colors text-[11px]"
                >
                  Clear Completed
                </button>
              )}
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-neutral-500 text-xs">
                  <CheckSquare className="w-6 h-6 opacity-30 mb-2" />
                  <p>No tasks match your filter.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-neutral-950/40 border-neutral-900 opacity-60'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="text-neutral-400 hover:text-amber-400 transition-colors"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`text-xs md:text-sm truncate ${
                          task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 ml-3">
                      {task.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                          {task.category}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Notes Tab */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 overflow-hidden">
            {/* Note Editor Pane (2 cols) */}
            <div className="md:col-span-2 border-r border-neutral-800 p-4 flex flex-col bg-neutral-950/40">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                <span>{editingNoteId ? 'Edit Note' : 'Create New Note'}</span>
                {editingNoteId && (
                  <button
                    onClick={() => {
                      setEditingNoteId(null);
                      setNewNoteTitle('');
                      setNewNoteContent('');
                      setNewNoteTags('');
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-300"
                  >
                    Cancel
                  </button>
                )}
              </h3>

              <form onSubmit={handleCreateOrUpdateNote} className="flex-1 flex flex-col space-y-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60"
                />

                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write thoughts, summaries, code ideas, or formulas..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-100 placeholder:text-neutral-500 resize-none focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans"
                />

                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  placeholder="Tags (comma separated, e.g. Research, Ideas)"
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60"
                />

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-semibold transition-colors"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
              </form>
            </div>

            {/* Saved Notes List (3 cols) */}
            <div className="md:col-span-3 p-4 flex flex-col overflow-hidden bg-neutral-900/30">
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="text"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search notes by title, body, or tag..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {filteredNotes.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-neutral-500 text-xs">
                    <FileEdit className="w-6 h-6 opacity-30 mb-2" />
                    <p>No notes found.</p>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <h4 className="text-xs md:text-sm font-semibold text-neutral-200">{note.title}</h4>
                        <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleCopyNote(note)}
                            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                            title="Copy note"
                          >
                            {copiedNoteId === note.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleStartEditNote(note)}
                            className="p-1 text-neutral-400 hover:text-amber-400 transition-colors"
                            title="Edit note"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap line-clamp-3 mb-2 font-sans">
                        {note.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {note.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-amber-300/80 border border-neutral-800 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="text-[10px] text-neutral-600 ml-auto font-mono">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
