#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const labelExemptions = new Set(['info', 'current-page-description', 'link-to-widget']);
const htmlTag = /<\/?[a-z][a-z0-9]*(?:\s[^<>]*)?\s*\/?>/i;

export function validateSettings({ formSource, dataSource }) {
  const errors = [];
  const warnings = [];
  const add = (list, code, file, path, message) => list.push({ code, file, path, message });
  function parse(source, file) {
    try {
      return { ok: true, value: JSON.parse(source) };
    } catch {
      add(errors, 'json_syntax', file, '$', 'Invalid JSON.');
      return { ok: false };
    }
  }
  const formFile = 'settings_form.json';
  const dataFile = 'settings_data.json';
  const form = parse(formSource, formFile);
  const data = dataSource === undefined ? { ok: false } : parse(dataSource, dataFile);
  if (data.ok && !record(data.value)) {
    add(errors, 'data_root', dataFile, '$', 'Settings data must be an object.');
  }
  if (!form.ok) return { errors, warnings };
  if (!record(form.value)) {
    add(errors, 'form_root', formFile, '$', 'Generation 4 requires an object with content and design tabs.');
    return { errors, warnings };
  }
  const names = new Map();
  for (const key of Object.keys(form.value)) {
    if (key !== 'content' && key !== 'design') {
      add(errors, 'form_tab_unknown', formFile, `$[${JSON.stringify(key)}]`, 'Only content and design tabs belong to the generation 4 form.');
    }
  }
  function inspectItem(item, path) {
    if (!record(item)) {
      add(errors, 'form_item', formFile, path, 'A field must be an object.');
      return;
    }
    if (!nonempty(item.type)) add(errors, 'form_type', formFile, `${path}.type`, 'A field needs a nonempty string type.');
    if (nonempty(item.name)) {
      if (names.has(item.name)) {
        add(warnings, 'duplicate_name', formFile, `${path}.name`, `Setting ${JSON.stringify(item.name)} also occurs at ${names.get(item.name)}.`);
      } else names.set(item.name, `${path}.name`);
      if (nonempty(item.type) && !labelExemptions.has(item.type) && !nonempty(item.label)) {
        add(warnings, 'label_missing', formFile, `${path}.label`, `Setting ${JSON.stringify(item.name)} has no label.`);
      }
    }
    if (typeof item.min === 'number' && typeof item.max === 'number' && item.min > item.max) {
      add(warnings, 'bounds_reversed', formFile, path, 'Numeric min exceeds max.');
    }
    if (item.type !== 'text') return;
    function checkText(value, file, valuePath) {
      const texts = typeof value === 'string' ? [value] :
        record(value) && !('_type' in value) ? Object.values(value).filter(v => typeof v === 'string') : [];
      if (texts.some(text => htmlTag.test(text))) {
        add(warnings, 'html_in_text', file, valuePath, 'A text default contains an HTML tag; consider rich-text.');
      }
    }
    for (const key of ['default', 'value']) {
      if (key in item) checkText(item[key], formFile, `${path}.${key}`);
    }
    if (nonempty(item.name) && data.ok && record(data.value) && Object.hasOwn(data.value, item.name)) {
      checkText(data.value[item.name], dataFile, `$[${JSON.stringify(item.name)}]`);
    }
  }
  for (const tab of ['content', 'design']) {
    const groups = form.value[tab];
    if (!Array.isArray(groups)) {
      add(errors, 'form_groups', formFile, `$.${tab}`, 'A tab must be an array of groups.');
      continue;
    }
    groups.forEach((group, groupIndex) => {
      const path = `$.${tab}[${groupIndex}]`;
      if (!record(group)) {
        add(errors, 'form_group', formFile, path, 'A group must be an object.');
      } else if (!Array.isArray(group.items)) {
        add(errors, 'form_items', formFile, `${path}.items`, 'A group needs an items array.');
      } else group.items.forEach((item, index) => inspectItem(item, `${path}.items[${index}]`));
    });
  }
  return { errors, warnings };
}

export function inspectDirectory(directory) {
  const formSource = readFileSync(join(directory, 'settings_form.json'), 'utf8');
  let dataSource;
  try { dataSource = readFileSync(join(directory, 'settings_data.json'), 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return validateSettings({ formSource, dataSource });
}

function main(args) {
  let json = false;
  const directories = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--json') json = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node validate-settings-form.mjs [--json] WIDGET_DIR...\nGeneration 4 settings_form.json and optional settings_data.json; no external dependencies.');
      return;
    } else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else directories.push(arg);
  }
  if (!directories.length) throw new Error('Provide at least one widget directory.');
  const results = directories.map(directory => ({ directory, ...inspectDirectory(directory) }));
  if (json) console.log(JSON.stringify({ results }, null, 2));
  else for (const result of results) {
    console.log(`${result.directory}: ${result.errors.length} errors, ${result.warnings.length} warnings`);
    for (const [level, diagnostics] of [['error', result.errors], ['warning', result.warnings]]) {
      for (const finding of diagnostics) console.log(`  ${level} ${finding.code}: ${finding.file}:${finding.path} ${finding.message}`);
    }
  }
  process.exitCode = results.some(result => result.errors.length) ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`Input error: ${error.message}`);
    process.exitCode = 2;
  }
}
