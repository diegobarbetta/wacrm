'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  DEFAULT_MODE,
  LEGACY_MODE_STORAGE_KEY,
  MODE_STORAGE_KEY,
  THEME_ID,
  isMode,
  type Mode,
} from '@/lib/themes';

interface ThemeContextValue {
  mode: Mode;
  setMode: (next: Mode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialMode(): Mode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  const fromAttr = document.documentElement.dataset.mode;
  if (isMode(fromAttr)) return fromAttr;
  try {
    const stored =
      localStorage.getItem(MODE_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_MODE_STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {
    // Local storage can be unavailable in private/sandboxed contexts.
  }
  return DEFAULT_MODE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(readInitialMode);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = THEME_ID;
      document.documentElement.dataset.mode = next;
    }
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // The current tab still updates even when persistence is unavailable.
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  useEffect(() => {
    try {
      const legacyMode = localStorage.getItem(LEGACY_MODE_STORAGE_KEY);
      if (!localStorage.getItem(MODE_STORAGE_KEY) && isMode(legacyMode)) {
        localStorage.setItem(MODE_STORAGE_KEY, legacyMode);
      }
      localStorage.removeItem('wacrm.theme');
    } catch {
      // Migration is best-effort only.
    }

    function onStorage(event: StorageEvent) {
      if (event.key === MODE_STORAGE_KEY && isMode(event.newValue)) {
        setModeState(event.newValue);
        document.documentElement.dataset.mode = event.newValue;
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      mode: DEFAULT_MODE,
      setMode: () => {},
      toggleMode: () => {},
    }
  );
}
