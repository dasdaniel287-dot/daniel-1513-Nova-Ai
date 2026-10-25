import React, { useState, useMemo } from 'react';
import { X, FileText, Table, Eye, Sparkles, Search, Layers, Download, AlertCircle } from 'lucide-react';
import { AttachmentFile } from '../types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: AttachmentFile[];
  onAskAboutDocument: (doc: AttachmentFile, promptText: string) => void;
  onRemoveDocument: (id: string) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  files,
  onAskAboutDocument,
  onRemoveDocument,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareFileId, setCompareFileId] = useState<string>(files[1]?.id || '');

  // Keep selected file in sync if files change
  React.useEffect(() => {
    if (files.length > 0 && (!selectedFileId || !files.some((f) => f.id === selectedFileId))) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  if (!isOpen) return null;

  const currentDoc = files.find((f) => f.id === selectedFileId) || files[0];
  const compareDoc = files.find((f) => f.id === compareFileId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-100 text-base flex items-center space-x-2">
                <span>Document Intelligence Hub</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-amber-300 font-mono">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Inspect structured documents, parse CSV tables, compare files, and ground AI reasoning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {files.length >= 2 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  compareMode
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{compareMode ? 'Exit Comparison' : 'Compare Documents'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-amber-400 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-neutral-200 mb-1">No Documents Uploaded</h3>
            <p className="text-xs text-neutral-400 max-w-md mb-4">
              Attach PDFs, CSVs, TXT, DOCX, or images directly in the chat input. They will be analyzed with grounded section citations.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">
            {/* Left File Selector List */}
            <div className="md:col-span-1 border-r border-neutral-800 bg-neutral-950/40 p-3 overflow-y-auto space-y-1.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 px-2 py-1">
                Active Attachments
              </div>
              {files.map((file) => {
                const isSelected = file.id === currentDoc?.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-start justify-between group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-neutral-100'
                        : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-neutral-800 text-amber-400 mt-0.5">
                        {file.mimeType.includes('csv') ? (
                          <Table className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium truncate text-neutral-200">{file.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {(file.size / 1024).toFixed(1)} KB • {file.mimeType.split('/')[1] || 'doc'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDocument(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-neutral-500 transition-opacity"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Document Preview Content */}
            <div className="md:col-span-3 flex flex-col overflow-hidden bg-neutral-900/40">
              {compareMode && compareDoc ? (
                // Side-by-side comparison
                <div className="flex-1 grid grid-cols-2 divide-x divide-neutral-800 overflow-hidden">
                  <DocumentViewPanel
                    doc={currentDoc}
                    onAsk={(prompt) => {
                      onAskAboutDocument(currentDoc, prompt);
                      onClose();
                    }}
                  />
                  <DocumentViewPanel
                    doc={compareDoc}
                    onAsk={(prompt) => {
                      onAskAboutDocument(compareDoc, prompt);
                      onClose();
                    }}
                  />
                </div>
              ) : (
                <DocumentViewPanel
                  doc={currentDoc}
                  onAsk={(prompt) => {
                    onAskAboutDocument(currentDoc, prompt);
                    onClose();
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {files.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Grounded QA: Ask questions directly grounded in this document</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (currentDoc) {
                    onAskAboutDocument(
                      currentDoc,
                      `Please provide an executive summary, key findings, and action items for "${currentDoc.name}".`
                    );
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors font-medium flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize Document</span>
              </button>

              {currentDoc?.mimeType.includes('csv') && (
                <button
                  onClick={() => {
                    onAskAboutDocument(
                      currentDoc,
                      `Analyze this CSV dataset: calculate descriptive statistics, detect outliers, and describe the top patterns.`
                    );
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium"
                >
                  Statistical Deep Dive
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for viewing single document details or CSV table
interface DocumentViewPanelProps {
  doc: AttachmentFile;
  onAsk: (prompt: string) => void;
}

const DocumentViewPanel: React.FC<DocumentViewPanelProps> = ({ doc, onAsk }) => {
  const isCsv = doc.mimeType.includes('csv') || doc.name.endsWith('.csv');
  const isImage = doc.mimeType.startsWith('image/');
  const [searchTerm, setSearchTerm] = useState('');

  // Parse CSV if applicable
  const csvData = useMemo(() => {
    if (!isCsv || !doc.extractedText) return null;
    try {
      const lines = doc.extractedText.trim().split('\n');
      if (lines.length === 0) return null;
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1).map((line) =>
        line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
      );
      return { headers, rows };
    } catch (e) {
      return null;
    }
  }, [doc, isCsv]);

  // Filter CSV rows
  const filteredRows = useMemo(() => {
    if (!csvData) return [];
    if (!searchTerm) return csvData.rows;
    const term = searchTerm.toLowerCase();
    return csvData.rows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(term))
    );
  }, [csvData, searchTerm]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Info */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-neutral-200 truncate">{doc.name}</h4>
          <p className="text-xs text-neutral-500 font-mono">
            {doc.mimeType} • {(doc.size / 1024).toFixed(1)} KB
          </p>
        </div>

        {isCsv && csvData && (
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rows..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        )}
      </div>

      {/* Content Viewer */}
      <div className="flex-1 p-4 overflow-auto">
        {isImage && doc.previewUrl ? (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={doc.previewUrl}
              alt={doc.name}
              className="max-h-full max-w-full rounded-xl object-contain border border-neutral-800 shadow-md"
            />
          </div>
        ) : isCsv && csvData ? (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="min-w-full divide-y divide-neutral-800 text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-300">
                <tr>
                  {csvData.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40">
                {filteredRows.slice(0, 100).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 text-neutral-300 truncate max-w-xs">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRows.length > 100 && (
              <div className="p-2 text-center text-[11px] text-neutral-500 bg-neutral-950 border-t border-neutral-800">
                Showing first 100 of {filteredRows.length} rows
              </div>
            )}
          </div>
        ) : doc.extractedText ? (
          <div className="font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            {doc.extractedText}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
            <FileText className="w-8 h-8 opacity-40 text-amber-400" />
            <p className="text-xs">Document ready for deep AI comprehension & multimodal Q&A.</p>
          </div>
        )}
      </div>
    </div>
  );
};
