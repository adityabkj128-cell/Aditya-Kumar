import { CalculatorConfig, ProjectFile } from '../types';

export function generateProjectFiles(config: CalculatorConfig, appName: string): ProjectFile[] {
  const themeClassMap: Record<string, string> = {
    slate: 'from-slate-900 to-slate-800 text-slate-100',
    zinc: 'from-zinc-900 to-zinc-800 text-zinc-100',
    emerald: 'from-emerald-950 to-slate-900 text-emerald-100',
    indigo: 'from-indigo-950 to-slate-900 text-indigo-100',
    amber: 'from-amber-950 to-slate-900 text-amber-100',
    rose: 'from-rose-950 to-slate-900 text-rose-100',
  };

  const appTsx = `import React, { useState } from 'react';
import { Calculator } from './components/Calculator';
import { HistoryPanel } from './components/HistoryPanel';

export default function App() {
  const [history, setHistory] = useState<Array<{ id: string; expression: string; result: string }>>([]);
  const [isDarkMode, setIsDarkMode] = useState(${config.darkMode});

  return (
    <div className={\`min-h-screen flex flex-col items-center justify-center p-4 transition-colors \${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'}\`}>
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">${appName || config.title}</h1>
        <p className="text-sm opacity-70">Built with Prompt2App • Modern Responsive Calculator</p>
      </header>

      <div className="w-full max-w-md">
        <Calculator 
          theme="${config.theme}"
          precision={${config.precision}}
          showScientific={${config.showScientific}}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onAddHistory={(entry) => setHistory(prev => [entry, ...prev.slice(0, 49)])}
          history={history}
        />
      </div>
    </div>
  );
}
`;

  const calculatorTsx = `import React, { useState, useEffect, useCallback } from 'react';
import { Delete, History, Moon, Sun } from 'lucide-react';

interface CalculatorProps {
  theme: string;
  precision: number;
  showScientific: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAddHistory: (entry: { id: string; expression: string; result: string }) => void;
  history: Array<{ id: string; expression: string; result: string }>;
}

export function Calculator({ 
  theme, 
  precision, 
  showScientific, 
  isDarkMode, 
  onToggleDarkMode,
  onAddHistory,
  history 
}: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const handleDigit = useCallback((d: string) => {
    if (awaitingNext) {
      setDisplay(d);
      setAwaitingNext(false);
    } else {
      setDisplay(display === '0' ? d : display + d);
    }
  }, [display, awaitingNext]);

  const handleDecimal = useCallback(() => {
    if (awaitingNext) {
      setDisplay('0.');
      setAwaitingNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, awaitingNext]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperator(null);
    setAwaitingNext(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (awaitingNext) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, awaitingNext]);

  const handlePercentage = useCallback(() => {
    const current = parseFloat(display);
    if (isNaN(current)) return;
    const val = current / 100;
    setDisplay(parseFloat(val.toFixed(precision)).toString());
  }, [display, precision]);

  const handleOperator = useCallback((op: string) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
      setEquation(\`\${current} \${op}\`);
    } else if (operator && !awaitingNext) {
      const res = calculate(prevValue, current, operator);
      setPrevValue(res);
      setDisplay(res.toString());
      setEquation(\`\${res} \${op}\`);
    } else {
      setEquation(\`\${prevValue} \${op}\`);
    }
    setOperator(op);
    setAwaitingNext(true);
  }, [display, prevValue, operator, awaitingNext]);

  const handleEquals = useCallback(() => {
    if (prevValue === null || !operator) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operator);
    const fullEq = \`\${equation} \${current} =\`;
    onAddHistory({
      id: Date.now().toString(),
      expression: fullEq,
      result: result.toString(),
    });
    setDisplay(result.toString());
    setEquation('');
    setPrevValue(null);
    setOperator(null);
    setAwaitingNext(true);
  }, [prevValue, operator, display, equation, onAddHistory]);

  function calculate(a: number, b: number, op: string): number {
    switch (op) {
      case '+': return parseFloat((a + b).toFixed(precision));
      case '-': return parseFloat((a - b).toFixed(precision));
      case '×': return parseFloat((a * b).toFixed(precision));
      case '÷': return b === 0 ? 0 : parseFloat((a / b).toFixed(precision));
      default: return b;
    }
  }

  return (
    <div className={\`rounded-3xl p-6 shadow-2xl transition-all border \${
      isDarkMode 
        ? 'bg-zinc-900 border-zinc-800 text-white' 
        : 'bg-white border-zinc-200 text-zinc-900'
    }\`}>
      {/* Top Controls: Dark Mode & History Toggle */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-700/20">
        <button 
          onClick={onToggleDarkMode} 
          className="p-2 rounded-xl hover:bg-zinc-500/20 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60">
          ${appName || config.title}
        </div>
        <button 
          onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
          className="p-2 rounded-xl hover:bg-zinc-500/20 transition-colors"
          title="View History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* Screen Display */}
      <div className="mb-6 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950/60 text-right">
        <div className="text-xs text-zinc-400 min-h-[1.25rem]">{equation}</div>
        <div className="text-4xl font-bold tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={handleClear} className="h-14 rounded-2xl font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20">AC</button>
        <button onClick={handleBackspace} className="h-14 rounded-2xl font-semibold bg-zinc-200 dark:bg-zinc-800 hover:opacity-80"><Delete className="w-5 h-5 mx-auto" /></button>
        <button onClick={handlePercentage} className="h-14 rounded-2xl font-semibold bg-zinc-200 dark:bg-zinc-800 hover:opacity-80">%</button>
        <button onClick={() => handleOperator('÷')} className="h-14 rounded-2xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700">÷</button>

        <button onClick={() => handleDigit('7')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">7</button>
        <button onClick={() => handleDigit('8')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">8</button>
        <button onClick={() => handleDigit('9')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">9</button>
        <button onClick={() => handleOperator('×')} className="h-14 rounded-2xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700">×</button>

        <button onClick={() => handleDigit('4')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">4</button>
        <button onClick={() => handleDigit('5')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">5</button>
        <button onClick={() => handleDigit('6')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">6</button>
        <button onClick={() => handleOperator('-')} className="h-14 rounded-2xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700">-</button>

        <button onClick={() => handleDigit('1')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">1</button>
        <button onClick={() => handleDigit('2')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">2</button>
        <button onClick={() => handleDigit('3')} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">3</button>
        <button onClick={() => handleOperator('+')} className="h-14 rounded-2xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700">+</button>

        <button onClick={() => handleDigit('0')} className="col-span-2 h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">0</button>
        <button onClick={handleDecimal} className="h-14 rounded-2xl font-semibold bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800">.</button>
        <button onClick={handleEquals} className="h-14 rounded-2xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700">=</button>
      </div>
    </div>
  );
}
`;

  const historyPanelTsx = `import React from 'react';
import { Trash2 } from 'lucide-react';

interface HistoryPanelProps {
  history: Array<{ id: string; expression: string; result: string }>;
  onClear: () => void;
  onSelect: (result: string) => void;
}

export function HistoryPanel({ history, onClear, onSelect }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-zinc-400">
        No recent calculations yet.
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
      <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <span>History Log</span>
        <button onClick={onClear} className="hover:text-rose-500 flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>
      {history.map(item => (
        <div 
          key={item.id}
          onClick={() => onSelect(item.result)}
          className="flex justify-between items-center text-xs p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <span className="opacity-70">{item.expression}</span>
          <span className="font-semibold text-emerald-500">{item.result}</span>
        </div>
      ))}
    </div>
  );
}
`;

  const packageJson = `{
  "name": "${(appName || 'prompt2app-calculator').toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
`;

  const readmeMd = `# ${appName || config.title}

Generated instantly by **Prompt2App** — Prompt to Application Studio.

## Included Features
- Arithmetic: Addition (+), Subtraction (-), Multiplication (×), Division (÷)
- Precision decimals (.) and percentage calculation (%)
- Instant Clear (AC) and Backspace (⌫)
- Calculation History Log with recall
- Integrated Light / Dark mode switcher
- Clean, responsive mobile & desktop UI
- Modern Tailwind CSS styling

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`
`;

  return [
    { name: 'App.tsx', path: 'src/App.tsx', language: 'typescript', content: appTsx },
    { name: 'Calculator.tsx', path: 'src/components/Calculator.tsx', language: 'typescript', content: calculatorTsx },
    { name: 'HistoryPanel.tsx', path: 'src/components/HistoryPanel.tsx', language: 'typescript', content: historyPanelTsx },
    { name: 'package.json', path: 'package.json', language: 'json', content: packageJson },
    { name: 'README.md', path: 'README.md', language: 'markdown', content: readmeMd },
  ];
}
