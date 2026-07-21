import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parse,
  type MessageFormatElement,
} from '@formatjs/icu-messageformat-parser';
import en from '../../messages/en.json';
import ptBR from '../../messages/pt-BR.json';

interface Messages {
  [key: string]: string | Messages;
}

function flatten(value: Messages, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') out.set(path, child);
    else
      for (const [nestedKey, nestedValue] of flatten(child, path))
        out.set(nestedKey, nestedValue);
  }
  return out;
}

function contract(value: string): string[] {
  const items: string[] = [];
  for (const match of value.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g))
    items.push(`template:${match[1].trim()}`);
  for (const match of value.matchAll(/<(\/)?([A-Za-z][\w-]*)\b[^>]*>/g))
    items.push(`tag:${match[1] ? '/' : ''}${match[2]}`);

  const normalized = value
    .replace(/\{\{[^{}]+\}\}/g, '')
    .replace(/<(\/)?([A-Za-z][\w-]*)\b[^>]*>/g, '<$1$2>');
  function visit(elements: MessageFormatElement[]) {
    for (const element of elements) {
      if (element.type >= 1 && element.type <= 6 && 'value' in element)
        items.push(`var:${element.value}`);
      if (element.type === 5 || element.type === 6)
        for (const option of Object.values(element.options))
          visit(option.value);
      if (element.type === 8) visit(element.children);
    }
  }
  try {
    visit(parse(normalized));
  } catch {
    for (const match of normalized.matchAll(/\{([A-Za-z_][\w.]*)\s*(?:,|\})/g))
      items.push(`var:${match[1]}`);
  }
  return items.sort();
}

describe('pt-BR messages', () => {
  const source = flatten(en as Messages);
  const translated = flatten(ptBR as Messages);

  it('has exact key parity with English', () => {
    expect([...translated.keys()].sort()).toEqual([...source.keys()].sort());
  });

  it('preserves ICU variables and rich-text tags', () => {
    for (const [key, value] of source)
      expect(contract(translated.get(key) ?? ''), key).toEqual(contract(value));
  });

  it('contains no translation-generation markers', () => {
    for (const [key, value] of translated) {
      expect(value, key).not.toMatch(/987654|ZXQWACRM|>>pt(?:_BR)?<</);
    }
  });

  it('contains no stale brand names, European Portuguese, or known translation artifacts', () => {
    const forbidden =
      /\bwacrm\b|Actualizar|Contacto|correio electr[oô]nico|factura[cç][aã]o|Controlo|Activar|Deactivar|utilizador|gasoduto|oleoduto|\btubo\b|\btrato\b|Repliques|Resubmit|Batalhas|Fauls[aã]o|evidenziador|inertar|empau|palavras- palavras|Reprojecto|Pied de rodapé|QUITK|\bButtons\b|\bDeals\b|\bWon\b/iu;

    for (const [key, value] of translated) {
      expect(value, key).not.toMatch(forbidden);
      expect(value, key).not.toMatch(/\s{2,}/);
    }
  });

  it('keeps untranslated values only for approved technical or universal terms', () => {
    const allowed = new Set([
      'Sidebar.beta',
      'Sidebar.defaultAvatar',
      'Header.defaultAvatar',
      'Dashboard.pipelineDonut.total',
      'Inbox.messageThread.status',
      'Inbox.replyQuote.audio',
      'Pipelines.form.status',
      'Automations.builder.config.placeholderTime',
      'Automations.builder.config.urlLabel',
      'Automations.builder.config.placeholderBody',
      'Broadcasts.wizard.personalize.imageUrlPlaceholder',
      'Flows.list.beta',
      'Flows.builder.form.tagUuidPlaceholder',
      'Settings.templates.btnUrl',
      'Settings.sections.whatsapp',
    ]);

    const identical = [...translated]
      .filter(([key, value]) => source.get(key) === value)
      .map(([key]) => key)
      .sort();
    expect(identical).toEqual([...allowed].sort());
  });
});

describe('visible source strings', () => {
  function sourceFiles(root: string): string[] {
    return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
      const path = join(root, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return /\.(?:ts|tsx)$/.test(entry.name) &&
        entry.name !== 'messages.test.ts'
        ? [path]
        : [];
    });
  }

  it('does not reintroduce known hard-coded English UI fallbacks', () => {
    const forbidden =
      /Delete this quick reply|Quick reply (?:updated|created)|aria-label=["']Settings sections|Saved, but Meta|Credentials saved and verified|Number is not fully registered|API connection successful|API connection failed|defaultValue:\s*["']Delete["']/;

    for (const file of sourceFiles(join(process.cwd(), 'src'))) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(forbidden);
    }
  });
});
