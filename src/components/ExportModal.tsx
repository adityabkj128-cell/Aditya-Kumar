import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (fileName: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadAll = () => {
    // Generate a downloadable JSON or bundled code file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, '-')}-project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="export-modal"
        className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl p-6 relative flex flex-col max-h-[90vh]"
      >
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Project Code</h3>
              <p className="text-xs text-zinc-400">Download or copy generated React & Tailwind source files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {project.files.map((file) => (
            <div 
              key={file.path}
              className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-indigo-300 block">{file.path}</span>
                <span className="text-[11px] text-zinc-500 uppercase font-medium">{file.language}</span>
              </div>
              <button
                onClick={() => handleCopy(file.name, file.content)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedFile === file.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === file.name ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">{project.files.length} production files ready</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
