import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  Globe,
  Mic,
  MicOff,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  VolumeX,
  FileText,
  FileCheck,
  Table,
  CheckSquare,
  Bookmark,
  Share2,
  Trash2,
  ChevronDown,
  Info,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import {
  Conversation,
  ChatMessage,
  AssistantMode,
  AttachmentFile,
  GroundingSource,
  UserPreferences,
} from '../types';
import { ASSISTANT_MODES } from '../constants/modes';
import { MarkdownRenderer } from './MarkdownRenderer';
import { extractTasksFromText } from '../utils/storage';

interface ChatViewProps {
  conversation: Conversation | null;
  activeMode: AssistantMode;
  onChangeMode: (mode: AssistantMode) => void;
  onSendMessage: (
    content: string,
    attachments: AttachmentFile[],
    enableSearch: boolean
  ) => void;
  onRegenerateMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  onOpenSandbox: (code?: string, language?: string) => void;
  onOpenDocumentHub: (file?: AttachmentFile) => void;
  onAddTaskFromChat: (title: string) => void;
  onAddNoteFromChat: (title: string, content: string) => void;
  onExport: (format: 'md' | 'json') => void;
  userPreferences: UserPreferences;
  onChangeTone: (tone: UserPreferences['tone']) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  activeMode,
  onChangeMode,
  onSendMessage,
  onRegenerateMessage,
  onEditMessage,
  isStreaming,
  onStopStreaming,
  onOpenSandbox,
  onOpenDocumentHub,
  onAddTaskFromChat,
  onAddNoteFromChat,
  onExport,
  userPreferences,
  onChangeTone,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [enableSearch, setEnableSearch] = useState(
    userPreferences.enableSearchByDefault || activeMode === 'research'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editPromptText, setEditPromptText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedNoteMsgId, setSavedNoteMsgId] = useState<string | null>(null);
  const [extractedTaskMsgId, setExtractedTaskMsgId] = useState<string | null>(null);
  const [activeTtsId, setActiveTtsId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const currentModeMeta =
    ASSISTANT_MODES.find((m) => m.id === activeMode) || ASSISTANT_MODES[0];

  // Auto-scroll on messages or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isStreaming]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Sync mode if activeMode is research
  useEffect(() => {
    if (activeMode === 'research') {
      setEnableSearch(true);
    }
  }, [activeMode]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  // Handle Form Submission
  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isStreaming) return;

    onSendMessage(inputText.trim(), attachments, enableSearch);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachmentFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // File size validation (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 25MB size limit.`);
        continue;
      }

      const reader = new FileReader();

      const filePromise = new Promise<AttachmentFile>((resolve) => {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          let extractedText = '';

          // If text or CSV or JSON, extract plain text representation
          if (
            file.type.includes('text') ||
            file.type.includes('csv') ||
            file.type.includes('json') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.md')
          ) {
            try {
              extractedText = atob(result.split('base64,')[1]);
            } catch (err) {
              // fallback
            }
          }

          resolve({
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            mimeType: file.type || (file.name.endsWith('.csv') ? 'text/csv' : 'application/pdf'),
            data: result,
            previewUrl: file.type.startsWith('image/') ? result : undefined,
            extractedText: extractedText || undefined,
          });
        };

        reader.readAsDataURL(file);
      });

      const processedFile = await filePromise;
      newAttachments.push(processedFile);
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Web Speech API Voice Dictation
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Bengali or English based on user preferences
      recognition.lang =
        userPreferences.preferredLanguage === 'bn'
          ? 'bn-BD'
          : userPreferences.preferredLanguage === 'bilingual'
          ? 'bn-BD'
          : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (e) {
      console.error('Speech initiation failed:', e);
      setIsRecording(false);
    }
  };

  // Text-To-Speech Playback
  const handlePlayTTS = async (message: ChatMessage) => {
    if (activeTtsId === message.id && audioPlayer) {
      audioPlayer.pause();
      setActiveTtsId(null);
      return;
    }

    try {
      setActiveTtsId(message.id);

      // Call server TTS endpoint
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          voice: userPreferences.voiceName || 'Kore',
        }),
      });

      if (!res.ok) {
        throw new Error('TTS server call failed');
      }

      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        setAudioPlayer(audio);
        audio.play();
        audio.onended = () => setActiveTtsId(null);
      }
    } catch (err) {
      console.warn('Backend TTS failed, falling back to browser SpeechSynthesis:', err);
      // Browser Web Speech fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message.content.slice(0, 1000));
        utterance.rate = 1.0;
        utterance.onend = () => setActiveTtsId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setActiveTtsId(null);
      }
    }
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExtractTasks = (msg: ChatMessage) => {
    const tasks = extractTasksFromText(msg.content);
    if (tasks.length === 0) {
      // Default to general task from the first sentence
      const firstLine = msg.content.split('\n')[0].replace(/^[#*-\s]+/, '').slice(0, 80);
      onAddTaskFromChat(firstLine || 'Review AI Response takeaways');
    } else {
      tasks.forEach((t) => onAddTaskFromChat(t));
    }
    setExtractedTaskMsgId(msg.id);
    setTimeout(() => setExtractedTaskMsgId(null), 2500);
  };

  const handleSaveToNotes = (msg: ChatMessage) => {
    const title = `NOVA [${currentModeMeta.name}] - ${new Date().toLocaleDateString()}`;
    onAddNoteFromChat(title, msg.content);
    setSavedNoteMsgId(msg.id);
    setTimeout(() => setSavedNoteMsgId(null), 2500);
  };

  const messages = conversation?.messages || [];

  return (
    <div className="flex-1 flex flex-col h-screen bg-neutral-900 text-neutral-100 overflow-hidden relative">
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 md:px-6 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          {/* Mode Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700/60 text-xs md:text-sm font-medium transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-neutral-100">{currentModeMeta.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-amber-300 hidden sm:inline">
                {currentModeMeta.badge}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {modeDropdownOpen && (
              <div className="absolute top-11 left-0 w-72 md:w-80 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 max-h-[75vh] overflow-y-auto">
                <div className="text-[11px] font-semibold text-neutral-400 px-3 py-1 uppercase tracking-wider">
                  Select Assistant Mode
                </div>
                {ASSISTANT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onChangeMode(mode.id);
                      setModeDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-2.5 ${
                      mode.id === activeMode
                        ? 'bg-amber-500/10 border border-amber-500/40 text-neutral-100'
                        : 'hover:bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-neutral-900 text-amber-400 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold">{mode.name}</span>
                        <span className="text-[10px] text-neutral-500">({mode.nameBn})</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                        {mode.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tone Selector */}
          <div className="hidden lg:flex items-center space-x-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs">
            {(['balanced', 'concise', 'in-depth', 'academic'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChangeTone(t)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  userPreferences.tone === t
                    ? 'bg-neutral-800 text-amber-400 font-medium'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-2">
          {/* Deep Search Toggle */}
          <button
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              enableSearch
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle Google Search Web Grounding"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Search</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                enableSearch ? 'bg-blue-400 animate-pulse' : 'bg-neutral-600'
              }`}
            />
          </button>

          {/* Export Menu */}
          {messages.length > 0 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onExport('md')}
                className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Export Markdown"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center py-10 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-neutral-950 shadow-xl shadow-amber-500/10 mb-5">
              <Sparkles className="w-7 h-7 fill-neutral-950" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-neutral-100 font-sans mb-1.5">
              {currentModeMeta.name}
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 max-w-md mb-5 leading-relaxed">
              {currentModeMeta.description}
            </p>

            {/* Active Capability Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-8 max-w-lg">
              {currentModeMeta.capabilities.map((cap, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-neutral-950 border border-neutral-800 text-neutral-400 font-mono"
                >
                  {cap}
                </span>
              ))}
            </div>

            {/* Starter Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
              {currentModeMeta.starterPrompts.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const prompt =
                      userPreferences.preferredLanguage === 'bn' ? starter.bn : starter.en;
                    setInputText(prompt);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-900/90 hover:border-amber-500/40 transition-all group flex flex-col justify-between"
                >
                  <p className="text-xs text-neutral-300 group-hover:text-amber-200 transition-colors leading-relaxed font-sans mb-2">
                    "{starter.en}"
                  </p>
                  <span className="text-[10px] text-neutral-500 font-mono line-clamp-1">
                    {starter.bn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Bubble Container */}
                  <div
                    className={`flex items-start space-x-3 max-w-full md:max-w-[90%] ${
                      isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold ${
                        isUser
                          ? 'bg-neutral-700 text-neutral-100'
                          : 'bg-gradient-to-tr from-amber-600 to-amber-300 text-neutral-950 shadow-sm'
                      }`}
                    >
                      {isUser ? 'U' : <Sparkles className="w-3.5 h-3.5 fill-current" />}
                    </div>

                    {/* Content Box */}
                    <div className="flex-1 min-w-0">
                      {/* Attached Files chip list */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {message.attachments.map((file) => (
                            <div
                              key={file.id}
                              onClick={() => onOpenDocumentHub(file)}
                              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 cursor-pointer transition-colors text-xs"
                            >
                              {file.mimeType.includes('csv') ? (
                                <Table className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span className="font-medium text-neutral-200 truncate max-w-[150px]">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {(file.size / 1024).toFixed(0)}KB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Main Message Text */}
                      <div
                        className={`p-4 rounded-2xl ${
                          isUser
                            ? 'bg-neutral-800 text-neutral-100 rounded-tr-sm'
                            : 'bg-neutral-950/70 border border-neutral-800/80 rounded-tl-sm text-neutral-100'
                        }`}
                      >
                        {isUser && editingMsgId === message.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editPromptText}
                              onChange={(e) => setEditPromptText(e.target.value)}
                              className="w-full bg-neutral-900 border border-amber-500/60 rounded-xl p-2.5 text-xs md:text-sm text-neutral-100 focus:outline-none resize-none"
                              rows={3}
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingMsgId(null)}
                                className="px-3 py-1 rounded-lg text-xs text-neutral-400 hover:text-neutral-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  onEditMessage(message.id, editPromptText);
                                  setEditingMsgId(null);
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-semibold"
                              >
                                Update & Send
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <MarkdownRenderer
                              content={message.content}
                              onOpenSandbox={(code, lang) => onOpenSandbox(code, lang)}
                            />

                            {/* Streaming cursor */}
                            {message.isStreaming && (
                              <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse rounded-sm" />
                            )}
                          </>
                        )}
                      </div>

                      {/* Google Search Grounding Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                          <div className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-400">
                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                            <span>Verified Web Sources ({message.sources.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((src, sIdx) => {
                              let domain = '';
                              try {
                                domain = new URL(src.url).hostname.replace('www.', '');
                              } catch {
                                domain = 'source';
                              }

                              return (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-blue-300 hover:text-blue-200 transition-colors"
                                  title={src.title}
                                >
                                  <ExternalLink className="w-3 h-3 text-blue-400" />
                                  <span className="truncate max-w-[180px]">{src.title}</span>
                                  <span className="text-[9px] text-neutral-500 font-mono">
                                    ({domain})
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Message Actions Bar */}
                      <div className="flex items-center space-x-2 mt-1.5 px-1 text-xs text-neutral-500">
                        <button
                          onClick={() => handleCopyMessage(message)}
                          className="hover:text-neutral-300 transition-colors flex items-center space-x-1"
                          title="Copy text"
                        >
                          {copiedMsgId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[11px]">Copy</span>
                        </button>

                        {!isUser && (
                          <>
                            <button
                              onClick={() => handlePlayTTS(message)}
                              className="hover:text-amber-400 transition-colors flex items-center space-x-1"
                              title="Listen to response (TTS)"
                            >
                              {activeTtsId === message.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span className="text-[11px] text-amber-400">Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Speak</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => onRegenerateMessage(message.id)}
                              className="hover:text-neutral-300 transition-colors flex items-center space-x-1"
                              title="Regenerate response"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Regenerate</span>
                            </button>

                            <button
                              onClick={() => handleExtractTasks(message)}
                              className="hover:text-amber-400 transition-colors flex items-center space-x-1"
                              title="Extract action items to tasks"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span className="text-[11px]">
                                {extractedTaskMsgId === message.id ? 'Tasks Added!' : 'Tasks'}
                              </span>
                            </button>

                            <button
                              onClick={() => handleSaveToNotes(message)}
                              className="hover:text-amber-400 transition-colors flex items-center space-x-1"
                              title="Save response to notes"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="text-[11px]">
                                {savedNoteMsgId === message.id ? 'Saved to Notes!' : 'Note'}
                              </span>
                            </button>
                          </>
                        )}

                        {isUser && (
                          <button
                            onClick={() => {
                              setEditingMsgId(message.id);
                              setEditPromptText(message.content);
                            }}
                            className="hover:text-neutral-300 transition-colors flex items-center space-x-1"
                            title="Edit prompt"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 md:p-5 border-t border-neutral-800/80 bg-neutral-950/95 shrink-0 z-10">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Staged Attachments Tray */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
                >
                  {att.mimeType.includes('csv') ? (
                    <Table className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {(att.size / 1024).toFixed(0)}KB
                  </span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="text-neutral-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="relative flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-inner focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message NOVA AI in English or বাংলা (${currentModeMeta.name})...`}
              rows={1}
              className="w-full bg-transparent p-3.5 pb-2 text-sm text-neutral-100 placeholder:text-neutral-500 resize-none focus:outline-none leading-relaxed font-sans max-h-48"
            />

            {/* Input Controls Footer */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-neutral-400">
              <div className="flex items-center space-x-1.5">
                {/* File Attachment Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.docx,.txt,.csv,.json,.md,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
                  title="Attach PDF, DOCX, CSV, TXT, or Image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Voice Dictation (Microphone) */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecording}
                  className={`p-2 rounded-xl transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Voice Input (EN/বাংলা)'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Deep Search Toggle in footer */}
                <button
                  type="button"
                  onClick={() => setEnableSearch(!enableSearch)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
                    enableSearch
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'hover:bg-neutral-800 text-neutral-400'
                  }`}
                  title="Web Search Grounding"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Send or Stop button */}
              <div>
                {isStreaming ? (
                  <button
                    onClick={onStopStreaming}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors flex items-center justify-center"
                    title="Stop Generating"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() && attachments.length === 0}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-neutral-950 transition-colors flex items-center justify-center shadow-md shadow-amber-500/10"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
            <span>NOVA AI supports English, বাংলা (Bengali), and document multimodal reasoning.</span>
            <span className="hidden sm:inline">Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};
