import React, { useState } from 'react';
import {
  X,
  Brain,
  Sliders,
  Shield,
  Volume2,
  Trash2,
  Download,
  Languages,
  Check,
  Sparkles,
  Server,
} from 'lucide-react';
import { UserPreferences, AssistantMode } from '../types';
import { ASSISTANT_MODES } from '../constants/modes';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onClearAllData: () => void;
  onExportAllData: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onClearAllData,
  onExportAllData,
}) => {
  const [formData, setFormData] = useState<UserPreferences>(preferences);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-100 text-base">NOVA Memory & Settings</h2>
              <p className="text-xs text-neutral-400">
                Personalization, long-term memory, response tone, and data controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Identity & Language</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Your Name / Calling Title
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Preferred Language (ভাষা)
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="bilingual">Bilingual (English & বাংলা)</option>
                  <option value="en">English (Primary)</option>
                  <option value="bn">বাংলা (Bengali Primary)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Memory & Persona */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center space-x-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>User Memory & Custom Guidance</span>
            </h3>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">
                NOVA AI incorporates this context into every response. Save your role, coding style preferences, domains of interest, or recurring instructions:
              </label>
              <textarea
                value={formData.customMemory}
                onChange={(e) => setFormData({ ...formData, customMemory: e.target.value })}
                rows={4}
                placeholder="e.g. I am a software engineer building distributed web systems. I prefer modular TypeScript code, concise explanations, and high architectural rigor."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs md:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 resize-none font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Tone & Model Parameters */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Response Calibrations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Response Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 focus:outline-none"
                >
                  <option value="balanced">Balanced (Clarity & Depth)</option>
                  <option value="concise">Concise & Direct (Minimal fluff)</option>
                  <option value="in-depth">In-Depth & Comprehensive</option>
                  <option value="academic">Academic & Technical</option>
                  <option value="friendly">Supportive & Conversational</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Default Assistant Mode
                </label>
                <select
                  value={formData.defaultMode}
                  onChange={(e) => setFormData({ ...formData, defaultMode: e.target.value as AssistantMode })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 focus:outline-none"
                >
                  {ASSISTANT_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name} ({mode.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex justify-between">
                  <span>Creativity Temperature</span>
                  <span className="font-mono text-amber-400">{formData.temperature}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                  <span>Deterministic (0.1)</span>
                  <span>Creative (1.2)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Text-To-Speech Voice
                </label>
                <select
                  value={formData.voiceName}
                  onChange={(e) => setFormData({ ...formData, voiceName: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-neutral-100 focus:outline-none"
                >
                  <option value="Kore">Kore (Warm, Clear, Articulate)</option>
                  <option value="Puck">Puck (Energetic, Natural)</option>
                  <option value="Zephyr">Zephyr (Calm, Reflective)</option>
                  <option value="Fenrir">Fenrir (Authoritative, Deep)</option>
                  <option value="Charon">Charon (Measured, Intellectual)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Sovereignty & Local Privacy</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 space-y-1.5 leading-relaxed">
              <p className="text-neutral-300 font-medium">Privacy Assured:</p>
              <p>
                Your conversation history, notes, tasks, and memory are stored locally on your device.
                API keys are never transmitted to client bundles. You maintain complete control over data retention.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={onExportAllData}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All Data (JSON)</span>
              </button>

              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe All Local Data</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-red-400">Confirm wipe?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-xs text-neutral-500 flex items-center space-x-2">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gemini 3.8 Flash • Search Grounding Enabled</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
