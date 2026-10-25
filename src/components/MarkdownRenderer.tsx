import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Play, Download } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onOpenSandbox?: (code: string, language: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onOpenSandbox }) => {
  return (
    <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed break-words font-sans space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !content.includes('\n' + codeString);

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded font-mono text-[13px] bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                code={codeString}
                language={language || 'text'}
                onOpenSandbox={onOpenSandbox}
              />
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-neutral-100 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200 font-semibold">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return <th className="px-3.5 py-2.5 font-medium tracking-wide">{children}</th>;
          },
          td({ children }) {
            return (
              <td className="px-3.5 py-2.5 text-neutral-700 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800/60">
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 font-medium underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-amber-500/60 pl-4 py-1 my-2 text-neutral-600 dark:text-neutral-300 italic bg-amber-500/5 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-neutral-700 dark:text-neutral-200">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-5 mb-3">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mt-4 mb-2.5 border-b border-neutral-200/50 dark:border-neutral-800 pb-1.5">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base md:text-lg font-semibold text-neutral-800 dark:text-neutral-200 mt-3.5 mb-2">{children}</h3>;
          },
          p({ children }) {
            return <p className="mb-2.5 leading-relaxed text-neutral-800 dark:text-neutral-200">{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  code: string;
  language: string;
  onOpenSandbox?: (code: string, language: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onOpenSandbox }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      markdown: 'md',
      sh: 'sh',
      bash: 'sh',
    };
    const ext = extMap[language.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canRunSandbox = ['javascript', 'js', 'html', 'css'].includes(language.toLowerCase()) && onOpenSandbox;

  return (
    <div className="relative my-3.5 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/90 border-b border-neutral-800 text-xs text-neutral-400">
        <span className="font-mono font-medium uppercase tracking-wider text-amber-400/90 text-[11px]">
          {language}
        </span>
        <div className="flex items-center space-x-1.5">
          {canRunSandbox && (
            <button
              onClick={() => onOpenSandbox(code, language)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors text-[11px] font-medium"
              title="Run code in isolated browser sandbox"
            >
              <Play className="w-3 h-3 text-amber-400" />
              <span>Run Sandbox</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 transition-colors text-[11px]"
            title="Download code file"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 transition-colors text-[11px]"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-neutral-200 bg-neutral-950/95 selection:bg-amber-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};
