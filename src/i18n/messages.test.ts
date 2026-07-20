import { describe, expect, it } from 'vitest';
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
});
