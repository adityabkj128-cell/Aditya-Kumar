import { CalculatorConfig, ThemeColor } from '../types';

export function parsePromptForCalculator(prompt: string): {
  appName: string;
  config: Partial<CalculatorConfig>;
} {
  const lower = prompt.toLowerCase();

  // Detect theme
  let theme: ThemeColor = 'indigo';
  if (lower.includes('emerald') || lower.includes('green') || lower.includes('हरा')) {
    theme = 'emerald';
  } else if (lower.includes('rose') || lower.includes('red') || lower.includes('गुलाबी') || lower.includes('लाल')) {
    theme = 'rose';
  } else if (lower.includes('amber') || lower.includes('orange') || lower.includes('yellow') || lower.includes('पीला')) {
    theme = 'amber';
  } else if (lower.includes('slate') || lower.includes('blue') || lower.includes('नीला')) {
    theme = 'slate';
  } else if (lower.includes('zinc') || lower.includes('monochrome') || lower.includes('black and white')) {
    theme = 'zinc';
  }

  // Detect dark mode
  let darkMode = true;
  if (lower.includes('light mode') || lower.includes('white mode') || lower.includes('लाइट')) {
    darkMode = false;
  } else if (lower.includes('dark') || lower.includes('डार्क') || lower.includes('black')) {
    darkMode = true;
  }

  // Detect scientific keys
  const showScientific = lower.includes('scientific') || lower.includes('वैज्ञानिक') || lower.includes('sqrt') || lower.includes('sin') || lower.includes('math');

  // Detect sound
  const soundEnabled = lower.includes('sound') || lower.includes('audio') || lower.includes('click sound') || lower.includes('ध्वनि');

  // Detect precision
  let precision = 4;
  if (lower.includes('2 decimal') || lower.includes('2 दशमलव')) {
    precision = 2;
  } else if (lower.includes('6 decimal') || lower.includes('6 दशमलव')) {
    precision = 6;
  } else if (lower.includes('8 decimal')) {
    precision = 8;
  }

  // Name extraction
  let appName = 'Prompt2App Calculator';
  if (lower.includes('financial') || lower.includes('finance')) {
    appName = 'Financial & Discount Calculator';
  } else if (lower.includes('scientific')) {
    appName = 'Scientific Calculator Pro';
  } else if (lower.includes('minimalist') || lower.includes('minimal')) {
    appName = 'Minimalist Clean Calc';
  } else if (lower.includes('smart')) {
    appName = 'Smart Responsive Calculator';
  }

  return {
    appName,
    config: {
      title: appName,
      theme,
      darkMode,
      showHistory: true,
      showScientific,
      soundEnabled,
      precision,
      roundedKeys: true,
      layout: 'standard',
    },
  };
}

export function applyModificationPrompt(
  currentConfig: CalculatorConfig,
  prompt: string
): Partial<CalculatorConfig> {
  const lower = prompt.toLowerCase();
  const updates: Partial<CalculatorConfig> = {};

  if (lower.includes('emerald') || lower.includes('green') || lower.includes('हरा')) {
    updates.theme = 'emerald';
  } else if (lower.includes('indigo') || lower.includes('purple') || lower.includes('बैंगनी')) {
    updates.theme = 'indigo';
  } else if (lower.includes('rose') || lower.includes('red') || lower.includes('लाल')) {
    updates.theme = 'rose';
  } else if (lower.includes('amber') || lower.includes('yellow') || lower.includes('पीला')) {
    updates.theme = 'amber';
  } else if (lower.includes('slate')) {
    updates.theme = 'slate';
  } else if (lower.includes('zinc') || lower.includes('grey') || lower.includes('gray')) {
    updates.theme = 'zinc';
  }

  if (lower.includes('dark') || lower.includes('डार्क')) {
    updates.darkMode = true;
  } else if (lower.includes('light') || lower.includes('लाइट')) {
    updates.darkMode = false;
  }

  if (lower.includes('scientific') || lower.includes('sqrt') || lower.includes('power') || lower.includes('pi') || lower.includes('वैज्ञानिक')) {
    updates.showScientific = true;
  } else if (lower.includes('remove scientific') || lower.includes('hide scientific') || lower.includes('basic')) {
    updates.showScientific = false;
  }

  if (lower.includes('sound') || lower.includes('audio') || lower.includes('beep') || lower.includes('ध्वनि')) {
    if (lower.includes('disable') || lower.includes('off') || lower.includes('mute') || lower.includes('बंद')) {
      updates.soundEnabled = false;
    } else {
      updates.soundEnabled = true;
    }
  }

  if (lower.includes('2 decimal')) updates.precision = 2;
  if (lower.includes('4 decimal')) updates.precision = 4;
  if (lower.includes('6 decimal')) updates.precision = 6;
  if (lower.includes('8 decimal')) updates.precision = 8;

  return updates;
}
