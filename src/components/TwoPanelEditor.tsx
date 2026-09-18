import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Download, 
  Code2, 
  Settings2, 
  History as HistoryIcon, 
  Sparkles, 
  Send, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Check, 
  Copy, 
  FolderTree, 
  FileText, 
  Palette,
  Eye,
  Sliders,
  Maximize2,
  Undo2,
  Redo2,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Project, CalculatorConfig, ThemeColor, ProjectFile } from '../types';
import { LiveCalculator } from './LiveCalculator';
import { PublishDemoModal } from './PublishDemoModal';
import { ExportModal } from './ExportModal';
import { generateProjectFiles } from '../utils/codeGenerator';

interface TwoPanelEditorProps {
  project: Project;
  onSaveProject: (updated: Project) => void;
  onBackToDashboard: () => void;
  onModifyApp: (prompt: string) => Promise<void>;
  isModifying: boolean;
  onOpenStandaloneDemo: () => void;
}

export function TwoPanelEditor({
  project,
  onSaveProject,
  onBackToDashboard,
  onModifyApp,
  isModifying,
  onOpenStandaloneDemo,
}: TwoPanelEditorProps) {
  // Left panel view tab
  const [leftTab, setLeftTab] = useState<'files' | 'settings' | 'history'>('files');
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    project.files[0]?.path || 'src/components/Calculator.tsx'
  );
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [modificationInput, setModificationInput] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [projectName, setProjectName] = useState(project.name);

  // Milestone 2: Undo / Redo state stack
  const [historyStack, setHistoryStack] = useState<Project[]>([project]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Sync project into history when version increases
  React.useEffect(() => {
    setProjectName(project.name);
    const currentRecorded = historyStack[historyIndex];
    if (!currentRecorded || currentRecorded.version !== project.version || currentRecorded.updatedAt !== project.updatedAt) {
      // Don't duplicate identical
      if (currentRecorded && JSON.stringify(currentRecorded.config) === JSON.stringify(project.config) && currentRecorded.name === project.name) {
        return;
      }
      const newStack = historyStack.slice(0, historyIndex + 1);
      newStack.push(project);
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    }
  }, [project]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, historyStack]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const target = historyStack[nextIdx];
      onSaveProject(target);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const target = historyStack[nextIdx];
      onSaveProject(target);
    }
  };

  // Active file content
  const currentFile: ProjectFile | undefined = project.files.find(
    (f) => f.path === selectedFilePath
  ) || project.files[0];

  const handleSave = () => {
    const updated: Project = {
      ...project,
      name: projectName,
      updatedAt: new Date().toISOString(),
    };
    onSaveProject(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleConfigChange = (partial: Partial<CalculatorConfig>) => {
    const updatedConfig: CalculatorConfig = {
      ...project.config,
      ...partial,
    };
    const updated: Project = {
      ...project,
      config: updatedConfig,
      updatedAt: new Date().toISOString(),
    };
    onSaveProject(updated);
  };

  const handleApplyModify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modificationInput.trim() || isModifying) return;
    const promptToApply = modificationInput.trim();
    setModificationInput('');
    await onModifyApp(promptToApply);
  };

  const handleRestoreVersion = (snapshotConfig: CalculatorConfig, versionNumber: number) => {
    const now = new Date().toISOString();
    const restored: Project = {
      ...project,
      config: snapshotConfig,
      version: project.version + 1,
      updatedAt: now,
      files: generateProjectFiles(snapshotConfig, project.name),
      promptHistory: [
        ...(project.promptHistory || []),
        {
          prompt: `Restored settings from v${versionNumber}.0`,
          timestamp: now,
          version: project.version + 1,
          configSnapshot: snapshotConfig,
        },
      ],
    };
    onSaveProject(restored);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const quickPillModifications = [
    { label: '🌿 Emerald Theme', prompt: 'Change calculator theme to emerald with glowing accents' },
    { label: '🔬 Scientific Keys', prompt: 'Add scientific math keys like sqrt, powers, pi, and square' },
    { label: '🌓 Dark Mode', prompt: 'Toggle dark mode to be on by default with high contrast display' },
    { label: '🔊 Audio Feedback', prompt: 'Enable audio sound feedback on button clicks' },
    { label: '🎯 6 Decimal Precision', prompt: 'Set calculation decimal precision to 6 decimals' },
  ];

  const handleCopyCurrentCode = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Device width classes
  const deviceWidthMap = {
    mobile: 'max-w-[360px]',
    tablet: 'max-w-[480px]',
    desktop: 'max-w-[560px]',
  };

  const isPublished = project.status === 'published';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Action Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            id="editor-back-btn"
            type="button"
            onClick={onBackToDashboard}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

          {/* Project Title Input */}
          <div className="flex items-center gap-2">
            <input
              id="project-title-input"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleSave}
              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 font-bold text-sm sm:text-base text-white px-1 py-0.5 focus:outline-none transition-colors max-w-[180px] sm:max-w-[280px] truncate"
            />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden md:inline font-mono">
              v{project.version}.0
            </span>
          </div>

          {/* Draft vs Published Badge */}
          {isPublished ? (
            <span 
              onClick={() => setShowPublishModal(true)}
              className="cursor-pointer text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm hover:bg-emerald-500/25 transition-colors"
              title="Click to view published details & share link"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PUBLISHED</span>
            </span>
          ) : (
            <span 
              onClick={() => setShowPublishModal(true)}
              className="cursor-pointer text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              title="Click to publish live"
            >
              DRAFT
            </span>
          )}

          {/* Undo / Redo controls (Milestone 2) */}
          <div className="flex items-center gap-1 bg-zinc-950/70 border border-zinc-800 rounded-xl p-0.5 ml-1">
            <button
              id="editor-undo-btn"
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                historyIndex <= 0 
                  ? 'text-zinc-600 cursor-not-allowed' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-95'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="editor-redo-btn"
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= historyStack.length - 1}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                historyIndex >= historyStack.length - 1 
                  ? 'text-zinc-600 cursor-not-allowed' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-95'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono text-zinc-500 px-1.5 select-none hidden xl:inline">
              {historyIndex + 1}/{historyStack.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export button */}
          <button
            id="editor-export-btn"
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Save Project Button */}
          <button
            id="editor-save-btn"
            type="button"
            onClick={handleSave}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              savedFeedback
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
            }`}
          >
            {savedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{savedFeedback ? 'Saved to Local Storage!' : 'Save Project'}</span>
          </button>

          {/* Publish / Status Button (Milestone 3) */}
          <button
            id="editor-publish-btn"
            type="button"
            onClick={() => setShowPublishModal(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isPublished
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isPublished ? 'Published Settings' : 'Publish App'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Project View */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/70">
          {/* Subheader tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                id="tab-files"
                type="button"
                onClick={() => setLeftTab('files')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                  leftTab === 'files'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Files & Code</span>
              </button>

              <button
                id="tab-settings"
                type="button"
                onClick={() => setLeftTab('settings')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                  leftTab === 'settings'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>App Settings</span>
              </button>

              <button
                id="tab-history"
                type="button"
                onClick={() => setLeftTab('history')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                  leftTab === 'history'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Version History</span>
              </button>
            </div>

            {leftTab === 'files' && currentFile && (
              <button
                onClick={handleCopyCurrentCode}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[400px] lg:max-h-[calc(100vh-140px)]">
            {leftTab === 'files' && (
              <div className="flex flex-col h-full space-y-4">
                {/* File selector pill bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {project.files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-1.5 ${
                        selectedFilePath === file.path
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>{file.name}</span>
                    </button>
                  ))}
                </div>

                {/* Code syntax viewer */}
                <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto leading-relaxed text-zinc-300">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80 text-[11px] text-zinc-500">
                    <span>{currentFile?.path}</span>
                    <span>{currentFile?.content.split('\n').length} lines</span>
                  </div>
                  <pre className="whitespace-pre overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    {currentFile?.content}
                  </pre>
                </div>
              </div>
            )}

            {leftTab === 'settings' && (
              <div className="space-y-6 max-w-md">
                {/* App Title */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    App Display Title
                  </label>
                  <input
                    type="text"
                    value={project.config.title}
                    onChange={(e) => handleConfigChange({ title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Theme Color Palette */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Accent Theme Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['indigo', 'emerald', 'slate', 'zinc', 'amber', 'rose'] as ThemeColor[]).map((thm) => (
                      <button
                        key={thm}
                        type="button"
                        onClick={() => handleConfigChange({ theme: thm })}
                        className={`p-2.5 rounded-xl border text-xs capitalize font-medium flex items-center gap-2 transition-all ${
                          project.config.theme === thm
                            ? 'border-indigo-500 bg-indigo-500/15 text-white'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${
                          thm === 'indigo' ? 'bg-indigo-500' :
                          thm === 'emerald' ? 'bg-emerald-500' :
                          thm === 'slate' ? 'bg-slate-400' :
                          thm === 'zinc' ? 'bg-zinc-400' :
                          thm === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span>{thm}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle features */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Scientific Math Row</div>
                      <div className="text-[11px] text-zinc-500">Show square root, powers, pi buttons</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={project.config.showScientific}
                      onChange={(e) => handleConfigChange({ showScientific: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Dark Mode by Default</div>
                      <div className="text-[11px] text-zinc-500">Start calculator in high-contrast dark theme</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={project.config.darkMode}
                      onChange={(e) => handleConfigChange({ darkMode: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Sound Feedback</div>
                      <div className="text-[11px] text-zinc-500">Play audio clicks on keypad taps</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={project.config.soundEnabled}
                      onChange={(e) => handleConfigChange({ soundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-zinc-200">Decimal Precision</span>
                      <span className="text-xs font-mono text-indigo-400 font-bold">{project.config.precision} Places</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      value={project.config.precision}
                      onChange={(e) => handleConfigChange({ precision: parseInt(e.target.value, 10) })}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HistoryIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Version History ({project.promptHistory?.length || 1})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    Active: v{project.version}.0
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(project.promptHistory || [{ prompt: project.prompt, timestamp: project.createdAt, version: 1, configSnapshot: project.config }])
                    .slice()
                    .reverse()
                    .map((h, i, arr) => {
                      const verNum = h.version ?? (arr.length - i);
                      const isCurrent = verNum === project.version;

                      return (
                        <div 
                          key={i}
                          className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                            isCurrent
                              ? 'bg-indigo-950/25 border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-sm'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                v{verNum}.0
                              </span>
                              {isCurrent ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active Version
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  Historical
                                </span>
                              )}
                            </div>
                            <span className="text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-zinc-200 font-medium leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900">
                            {h.prompt}
                          </p>

                          {!isCurrent && h.configSnapshot && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleRestoreVersion(h.configSnapshot!, verNum)}
                                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1.5 active:scale-95"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore v{verNum}.0</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview & "Modify App" field */}
        <div className="w-full lg:w-1/2 flex flex-col bg-zinc-950">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/40 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Interactive Preview</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Running
              </span>
            </div>

            {/* Device frame switchers */}
            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceView === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Mobile Viewport"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceView === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Tablet Viewport"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceView === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Desktop Viewport"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Calculator Stage */}
          <div className="flex-1 p-4 sm:p-6 flex items-center justify-center overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950 min-h-[460px]">
            <div className={`w-full transition-all duration-300 ${deviceWidthMap[deviceView]}`}>
              <LiveCalculator 
                config={project.config}
                onUpdateConfig={handleConfigChange}
              />
            </div>
          </div>

          {/* "Modify App" Field (At bottom of right panel as requested) */}
          <div className="p-4 bg-zinc-900/90 border-t border-zinc-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Modify App</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Natural language iteration
              </span>
            </div>

            {/* Quick Pill Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {quickPillModifications.map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setModificationInput(pill.prompt)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white shrink-0 transition-colors border border-zinc-700/50"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Modification Input Form */}
            <form onSubmit={handleApplyModify} className="relative flex items-center gap-2">
              <input
                id="modify-app-input"
                type="text"
                value={modificationInput}
                onChange={(e) => setModificationInput(e.target.value)}
                placeholder="Describe what you want to change..."
                disabled={isModifying}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />

              <button
                id="modify-app-btn"
                type="submit"
                disabled={isModifying || !modificationInput.trim()}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all shrink-0 ${
                  isModifying
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
                }`}
              >
                {isModifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Publish Demo Modal */}
      <PublishDemoModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        project={project}
        onUpdateProject={onSaveProject}
        onOpenStandaloneDemo={onOpenStandaloneDemo}
      />

      {/* Export Code Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={project}
      />
    </div>
  );
}
