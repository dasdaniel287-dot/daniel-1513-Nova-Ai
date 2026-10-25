import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RefreshCw, Copy, Check, Download, Terminal, Eye, Code } from 'lucide-react';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  initialLanguage = 'javascript',
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');
  const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn' | 'info'; text: string; time: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setLanguage(initialLanguage);
    }
  }, [initialCode, initialLanguage]);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    setLogs([]);

    // Check if code is pure JS or HTML
    const isHtml = language.toLowerCase() === 'html' || code.trim().startsWith('<');
    if (isHtml) {
      setActiveTab('preview');
    }

    const timestamp = new Date().toLocaleTimeString();

    // Construct isolated sandbox script
    const sandboxHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; color: #333; }
        </style>
      </head>
      <body>
        ${isHtml ? code : '<div id="app"></div>'}
        <script>
          const post = (type, args) => {
            try {
              const text = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
              window.parent.postMessage({ type: 'SANDBOX_LOG', level: type, text }, '*');
            } catch(e) {
              window.parent.postMessage({ type: 'SANDBOX_LOG', level: 'error', text: String(e) }, '*');
            }
          };

          console.log = (...args) => post('log', args);
          console.error = (...args) => post('error', args);
          console.warn = (...args) => post('warn', args);
          console.info = (...args) => post('info', args);

          window.onerror = (msg, url, line) => {
            console.error('Runtime Error: ' + msg + ' (line ' + line + ')');
            return true;
          };

          try {
            ${!isHtml ? code : ''}
          } catch(err) {
            console.error(err.name + ': ' + err.message);
          }
        </script>
      </body>
      </html>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = sandboxHtml;
    }

    setTimeout(() => {
      setIsRunning(false);
    }, 400);
  };

  // Listen to messages from sandbox iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SANDBOX_LOG') {
        setLogs((prev) => [
          ...prev,
          {
            type: e.data.level || 'log',
            text: e.data.text || '',
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'html' ? 'html' : 'js';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sandbox_snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-100 text-sm md:text-base flex items-center space-x-2">
                <span>NOVA Sandbox Workspace</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 uppercase">
                  {language}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Safely test and run generated code in an isolated environment
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium text-xs transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running...' : 'Execute'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: Split view Editor & Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
          {/* Editor Column */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/50">
            <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/40">
              <span className="font-mono">Input Editor</span>
              <button
                onClick={() => setCode('')}
                className="text-neutral-500 hover:text-neutral-300 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write or paste JavaScript or HTML here..."
              className="flex-1 p-4 bg-transparent font-mono text-[13px] leading-relaxed text-neutral-200 resize-none focus:outline-none focus:ring-0 selection:bg-amber-500/20"
              spellCheck={false}
            />
          </div>

          {/* Execution & Output Column */}
          <div className="flex flex-col bg-neutral-900/30">
            {/* Output Tab switcher */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/40 text-xs">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'console'
                      ? 'bg-neutral-800 text-amber-400 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Console ({logs.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-neutral-800 text-amber-400 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>DOM Preview</span>
                </button>
              </div>

              {activeTab === 'console' && logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Clear Console
                </button>
              )}
            </div>

            {/* Tab Panes */}
            <div className="flex-1 relative overflow-auto p-3">
              {activeTab === 'console' ? (
                <div className="font-mono text-xs space-y-1.5 h-full">
                  {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                      <Terminal className="w-8 h-8 opacity-40" />
                      <p>Click "Execute" to run script and inspect console outputs.</p>
                    </div>
                  ) : (
                    logs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border leading-relaxed flex items-start space-x-2 ${
                          log.type === 'error'
                            ? 'bg-red-950/40 border-red-800/60 text-red-300'
                            : log.type === 'warn'
                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                            : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-200'
                        }`}
                      >
                        <span className="text-[10px] text-neutral-500 mt-0.5 select-none">{log.time}</span>
                        <pre className="flex-1 whitespace-pre-wrap break-words">{log.text}</pre>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-neutral-700">
                  <iframe
                    ref={iframeRef}
                    title="Code Sandbox Output"
                    sandbox="allow-scripts"
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-5 py-2 border-t border-neutral-800 bg-neutral-950 text-xs text-neutral-500 flex items-center justify-between">
          <span>Security: Isolated client-side sandbox container. No backend server execution.</span>
          <span>Shortcut: Click Execute to run</span>
        </div>
      </div>
    </div>
  );
};
