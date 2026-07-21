'use client';

import { Check, Moon, SunMoon, Sun } from 'lucide-react';

import { useTheme } from '@/hooks/use-theme';
import { MODES, type Mode } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { SettingsPanelHead } from './settings-panel-head';

/**
 * Appearance panel — SignaCon light/dark mode.
 *
 * Persistence: localStorage only (device-scoped). The boot script in
 * layout.tsx replays both choices before first paint on subsequent
 * loads.
 */
export function AppearancePanel() {
  const { mode, setMode } = useTheme();
  const t = useTranslations('Settings.appearance');

  return (
    <section className="animate-in fade-in-50 max-w-3xl duration-200">
      <SettingsPanelHead title={t('title')} description={t('description')} />

      <div className="space-y-4">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <SunMoon className="text-muted-foreground size-4" />
          {t('mode')}
        </h3>

        <div
          role="radiogroup"
          aria-label="Modo de cor"
          className="grid max-w-md grid-cols-2 gap-3"
        >
          {MODES.map((m) => (
            <ModeCard
              key={m}
              mode={m}
              isActive={m === mode}
              onPick={() => setMode(m)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModeCard({
  mode,
  isActive,
  onPick,
}: {
  mode: Mode;
  isActive: boolean;
  onPick: () => void;
}) {
  const t = useTranslations('Settings.appearance');
  const isLight = mode === 'light';
  const Icon = isLight ? Sun : Moon;
  return (
    <button
      type="button"
      role="radio"
      onClick={onPick}
      aria-checked={isActive}
      aria-label={t('useMode', { mode })}
      className={cn(
        'bg-card flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
        isActive
          ? 'border-primary/60 ring-primary/40 ring-2'
          : 'border-border hover:border-border hover:bg-muted/40'
      )}
    >
      <span
        aria-hidden
        className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-foreground flex-1 text-sm font-semibold capitalize">
        {mode}
      </span>
      {isActive && (
        <span className="bg-primary/15 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <Check className="h-3 w-3" />
          {t('active')}
        </span>
      )}
    </button>
  );
}
