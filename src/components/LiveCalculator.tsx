import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Delete, 
  History, 
  Moon, 
  Sun, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Sparkles,
  Equal
} from 'lucide-react';
import { CalculatorConfig, CalculationHistoryItem } from '../types';

interface LiveCalculatorProps {
  config: CalculatorConfig;
  onUpdateConfig?: (partial: Partial<CalculatorConfig>) => void;
  className?: string;
  isStandalone?: boolean;
}

export function LiveCalculator({ 
  config, 
  onUpdateConfig, 
  className = '',
  isStandalone = false 
}: LiveCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [isLocalDark, setIsLocalDark] = useState<boolean>(config.darkMode);
  const [soundOn, setSoundOn] = useState<boolean>(config.soundEnabled);

  // Sync when config changes
  useEffect(() => {
    setIsLocalDark(config.darkMode);
  }, [config.darkMode]);

  useEffect(() => {
    setSoundOn(config.soundEnabled);
  }, [config.soundEnabled]);

  // Gentle audio beep using AudioContext without external assets
  const playClickSound = useCallback((frequency = 440, type: OscillatorType = 'sine') => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio might be blocked until user gesture, ignore safely
    }
  }, [soundOn]);

  const handleDigit = useCallback((digit: string) => {
    playClickSound(520, 'sine');
    if (awaitingNext) {
      setDisplay(digit);
      setAwaitingNext(false);
    } else {
      if (display === '0') {
        setDisplay(digit);
      } else {
        if (display.replace(/[^0-9]/g, '').length < 15) {
          setDisplay(display + digit);
        }
      }
    }
  }, [awaitingNext, display, playClickSound]);

  const handleDecimal = useCallback(() => {
    playClickSound(580, 'sine');
    if (awaitingNext) {
      setDisplay('0.');
      setAwaitingNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [awaitingNext, display, playClickSound]);

  const handleClear = useCallback(() => {
    playClickSound(300, 'triangle');
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperator(null);
    setAwaitingNext(false);
  }, [playClickSound]);

  const handleBackspace = useCallback(() => {
    playClickSound(350, 'triangle');
    if (awaitingNext) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [awaitingNext, display, playClickSound]);

  const handlePercentage = useCallback(() => {
    playClickSound(600, 'sine');
    const current = parseFloat(display);
    if (isNaN(current)) return;
    let result = 0;
    if (prevValue !== null && operator) {
      // percentage in context: e.g. 200 + 10% = 20
      result = (prevValue * current) / 100;
    } else {
      result = current / 100;
    }
    const rounded = parseFloat(result.toFixed(config.precision || 4));
    setDisplay(rounded.toString());
  }, [display, prevValue, operator, config.precision, playClickSound]);

  const performCalculation = (a: number, b: number, op: string): number => {
    const prec = config.precision || 4;
    let res = b;
    switch (op) {
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '×':
      case '*':
        res = a * b;
        break;
      case '÷':
      case '/':
        res = b === 0 ? 0 : a / b;
        break;
      default:
        res = b;
    }
    return parseFloat(res.toFixed(prec));
  };

  const handleOperator = useCallback((op: string) => {
    playClickSound(660, 'sine');
    const current = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(current);
      setEquation(`${current} ${op}`);
    } else if (operator && !awaitingNext) {
      const res = performCalculation(prevValue, current, operator);
      setPrevValue(res);
      setDisplay(res.toString());
      setEquation(`${res} ${op}`);
    } else {
      setEquation(`${prevValue} ${op}`);
    }
    setOperator(op);
    setAwaitingNext(true);
  }, [display, prevValue, operator, awaitingNext, playClickSound]);

  const handleEquals = useCallback(() => {
    playClickSound(880, 'sine');
    if (prevValue === null || !operator) return;

    const current = parseFloat(display);
    const result = performCalculation(prevValue, current, operator);
    const fullEq = `${equation} ${current} =`;

    const newHistoryItem: CalculationHistoryItem = {
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      expression: fullEq,
      result: result.toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
    setDisplay(result.toString());
    setEquation('');
    setPrevValue(null);
    setOperator(null);
    setAwaitingNext(true);
  }, [prevValue, operator, display, equation, playClickSound]);

  const handleScientific = useCallback((func: string) => {
    playClickSound(750, 'sine');
    const current = parseFloat(display);
    if (isNaN(current)) return;
    const prec = config.precision || 4;
    let res = 0;
    let label = '';

    switch (func) {
      case 'sqrt':
        res = Math.sqrt(Math.max(0, current));
        label = `√(${current})`;
        break;
      case 'sqr':
        res = Math.pow(current, 2);
        label = `(${current})²`;
        break;
      case 'sin':
        res = Math.sin((current * Math.PI) / 180);
        label = `sin(${current}°)`;
        break;
      case 'cos':
        res = Math.cos((current * Math.PI) / 180);
        label = `cos(${current}°)`;
        break;
      case 'tan':
        res = Math.tan((current * Math.PI) / 180);
        label = `tan(${current}°)`;
        break;
      case 'log':
        res = Math.log10(Math.max(0.0001, current));
        label = `log(${current})`;
        break;
      case 'pi':
        res = Math.PI;
        label = 'π';
        break;
      case 'negate':
        res = -current;
        label = `neg(${current})`;
        break;
    }

    const rounded = parseFloat(res.toFixed(prec));
    setHistory((prev) => [
      {
        id: 'calc_' + Date.now(),
        expression: `${label} =`,
        result: rounded.toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 49),
    ]);
    setDisplay(rounded.toString());
    setAwaitingNext(true);
  }, [display, config.precision, playClickSound]);

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in text inputs/modals
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%' || (e.shiftKey && e.key === '5')) {
        e.preventDefault();
        handlePercentage();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleBackspace, handleClear, handlePercentage]);

  // Theme color styles
  const themeAccents: Record<string, {
    operatorBtn: string;
    equalsBtn: string;
    glow: string;
    border: string;
    badge: string;
  }> = {
    indigo: {
      operatorBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95',
      equalsBtn: 'bg-indigo-700 hover:bg-indigo-600 text-white shadow-indigo-500/20 active:scale-95',
      glow: 'shadow-indigo-500/10',
      border: 'border-indigo-500/30',
      badge: 'text-indigo-400 bg-indigo-500/10',
    },
    emerald: {
      operatorBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95',
      equalsBtn: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95',
      glow: 'shadow-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'text-emerald-400 bg-emerald-500/10',
    },
    slate: {
      operatorBtn: 'bg-slate-700 hover:bg-slate-600 text-white active:scale-95',
      equalsBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95',
      glow: 'shadow-slate-500/10',
      border: 'border-slate-500/30',
      badge: 'text-slate-400 bg-slate-500/10',
    },
    zinc: {
      operatorBtn: 'bg-zinc-700 hover:bg-zinc-600 text-white active:scale-95',
      equalsBtn: 'bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95',
      glow: 'shadow-zinc-500/10',
      border: 'border-zinc-500/30',
      badge: 'text-zinc-400 bg-zinc-500/10',
    },
    amber: {
      operatorBtn: 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95',
      equalsBtn: 'bg-amber-700 hover:bg-amber-600 text-white shadow-amber-500/20 active:scale-95',
      glow: 'shadow-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'text-amber-400 bg-amber-500/10',
    },
    rose: {
      operatorBtn: 'bg-rose-600 hover:bg-rose-500 text-white active:scale-95',
      equalsBtn: 'bg-rose-700 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95',
      glow: 'shadow-rose-500/10',
      border: 'border-rose-500/30',
      badge: 'text-rose-400 bg-rose-500/10',
    },
  };

  const currentAccent = themeAccents[config.theme] || themeAccents.indigo;

  return (
    <div className={`relative transition-all duration-300 w-full max-w-sm mx-auto ${className}`}>
      {/* Calculator Shell */}
      <div 
        id="prompt2app-live-calc"
        className={`rounded-3xl p-5 shadow-2xl transition-all duration-300 border ${
          isLocalDark 
            ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-black/40' 
            : 'bg-white border-zinc-200/90 text-zinc-900 shadow-zinc-200/60'
        } ${currentAccent.glow}`}
      >
        {/* Top Control Bar: Dark mode, App Title, Sound, History Drawer Toggle */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-500/15">
          <div className="flex items-center gap-1.5">
            <button
              id="calc-dark-toggle"
              type="button"
              onClick={() => {
                const nextDark = !isLocalDark;
                setIsLocalDark(nextDark);
                onUpdateConfig?.({ darkMode: nextDark });
              }}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                isLocalDark 
                  ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700' 
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
              title="Toggle Calculator Dark/Light Mode"
            >
              {isLocalDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span className="text-[11px] font-medium">{isLocalDark ? 'Dark' : 'Light'}</span>
            </button>

            <button
              id="calc-sound-toggle"
              type="button"
              onClick={() => {
                const nextSound = !soundOn;
                setSoundOn(nextSound);
                onUpdateConfig?.({ soundEnabled: nextSound });
              }}
              className={`p-2 rounded-xl text-xs transition-colors ${
                soundOn
                  ? 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700'
                  : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
              }`}
              title="Sound Click Feedback"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-center px-1 truncate">
            <span className="text-xs font-semibold tracking-wide truncate opacity-80 block max-w-[120px]">
              {config.title || 'Calculator'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="calc-history-toggle"
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className={`p-2 rounded-xl relative transition-colors ${
                showHistoryDrawer 
                  ? 'bg-indigo-600 text-white' 
                  : isLocalDark 
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
              title="Calculation History"
            >
              <History className="w-3.5 h-3.5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div 
          className={`mb-4 p-4 rounded-2xl transition-colors text-right relative overflow-hidden ${
            isLocalDark ? 'bg-zinc-950/80 border border-zinc-800/80' : 'bg-zinc-100/90 border border-zinc-200'
          }`}
        >
          <div className="text-xs font-mono min-h-[1.25rem] text-zinc-400 dark:text-zinc-500 tracking-wider truncate">
            {equation || '\u00A0'}
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            {display}
          </div>
        </div>

        {/* Optional Scientific Row if enabled or modified */}
        {config.showScientific && (
          <div className="grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-zinc-500/15">
            <button
              onClick={() => handleScientific('sqrt')}
              className={`h-9 text-xs font-semibold rounded-xl transition-all ${
                isLocalDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              √x
            </button>
            <button
              onClick={() => handleScientific('sqr')}
              className={`h-9 text-xs font-semibold rounded-xl transition-all ${
                isLocalDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              x²
            </button>
            <button
              onClick={() => handleScientific('pi')}
              className={`h-9 text-xs font-semibold rounded-xl transition-all ${
                isLocalDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              π
            </button>
            <button
              onClick={() => handleScientific('negate')}
              className={`h-9 text-xs font-semibold rounded-xl transition-all ${
                isLocalDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              ±
            </button>
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 select-none">
          {/* Row 1: Clear, Backspace, Percentage, Division */}
          <button
            id="calc-btn-clear"
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl font-semibold text-sm bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 active:scale-95 transition-all"
          >
            AC
          </button>

          <button
            id="calc-btn-backspace"
            type="button"
            onClick={handleBackspace}
            className={`h-12 rounded-2xl font-semibold flex items-center justify-center transition-all active:scale-95 ${
              isLocalDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
            title="Backspace (⌫)"
          >
            <Delete className="w-4 h-4" />
          </button>

          <button
            id="calc-btn-percentage"
            type="button"
            onClick={handlePercentage}
            className={`h-12 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${
              isLocalDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            %
          </button>

          <button
            id="calc-btn-divide"
            type="button"
            onClick={() => handleOperator('÷')}
            className={`h-12 rounded-2xl font-bold text-base transition-all ${currentAccent.operatorBtn}`}
          >
            ÷
          </button>

          {/* Row 2: 7, 8, 9, Multiplication */}
          {['7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`calc-btn-${digit}`}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-12 rounded-2xl font-medium text-base transition-all active:scale-95 ${
                isLocalDark ? 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              {digit}
            </button>
          ))}
          <button
            id="calc-btn-multiply"
            type="button"
            onClick={() => handleOperator('×')}
            className={`h-12 rounded-2xl font-bold text-base transition-all ${currentAccent.operatorBtn}`}
          >
            ×
          </button>

          {/* Row 3: 4, 5, 6, Subtraction */}
          {['4', '5', '6'].map((digit) => (
            <button
              key={digit}
              id={`calc-btn-${digit}`}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-12 rounded-2xl font-medium text-base transition-all active:scale-95 ${
                isLocalDark ? 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              {digit}
            </button>
          ))}
          <button
            id="calc-btn-subtract"
            type="button"
            onClick={() => handleOperator('-')}
            className={`h-12 rounded-2xl font-bold text-base transition-all ${currentAccent.operatorBtn}`}
          >
            −
          </button>

          {/* Row 4: 1, 2, 3, Addition */}
          {['1', '2', '3'].map((digit) => (
            <button
              key={digit}
              id={`calc-btn-${digit}`}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-12 rounded-2xl font-medium text-base transition-all active:scale-95 ${
                isLocalDark ? 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              {digit}
            </button>
          ))}
          <button
            id="calc-btn-add"
            type="button"
            onClick={() => handleOperator('+')}
            className={`h-12 rounded-2xl font-bold text-base transition-all ${currentAccent.operatorBtn}`}
          >
            +
          </button>

          {/* Row 5: 0 (span 2), Decimal, Equals */}
          <button
            id="calc-btn-0"
            type="button"
            onClick={() => handleDigit('0')}
            className={`col-span-2 h-12 rounded-2xl font-medium text-base transition-all active:scale-95 ${
              isLocalDark ? 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            0
          </button>

          <button
            id="calc-btn-decimal"
            type="button"
            onClick={handleDecimal}
            className={`h-12 rounded-2xl font-bold text-base transition-all active:scale-95 ${
              isLocalDark ? 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            .
          </button>

          <button
            id="calc-btn-equals"
            type="button"
            onClick={handleEquals}
            className={`h-12 rounded-2xl font-bold text-lg flex items-center justify-center transition-all ${currentAccent.equalsBtn}`}
          >
            =
          </button>
        </div>

        {/* Sliding / Collapsible History Panel */}
        {showHistoryDrawer && (
          <div className="mt-4 pt-3 border-t border-zinc-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Calculation History ({history.length})
              </span>
              {history.length > 0 && (
                <button
                  id="calc-clear-history-btn"
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-400">
                No past calculations. Perform math above!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setDisplay(item.result);
                      setAwaitingNext(true);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isLocalDark
                        ? 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200'
                        : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800'
                    }`}
                    title="Click to recall result into display"
                  >
                    <div className="truncate mr-2">
                      <div className="opacity-60 text-[11px] truncate">{item.expression}</div>
                      <div className="text-[10px] opacity-40">{item.timestamp}</div>
                    </div>
                    <div className="font-mono font-bold text-sm text-emerald-500 shrink-0">
                      {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer info tag */}
        <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-zinc-400 opacity-70">
          <span>Prompt2App • v1.0</span>
          <span>Precision: {config.precision} Decimals</span>
        </div>
      </div>
    </div>
  );
}
