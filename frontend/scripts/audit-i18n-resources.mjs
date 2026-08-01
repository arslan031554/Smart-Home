import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(frontendRoot, 'src');
const localeRoot = path.join(sourceRoot, 'i18n', 'locales');

function flatten(value, prefix = '', result = {}) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => flatten(child, prefix ? `${prefix}.${index}` : String(index), result));
    return result;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, result);
    }
    return result;
  }

  result[prefix] = value;
  return result;
}

function collectSourceFiles(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceFiles(entryPath, result);
    else if (/\.[jt]sx?$/.test(entry.name)) result.push(entryPath);
  }
  return result;
}

const locales = Object.fromEntries(
  fs.readdirSync(localeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = path.join(localeRoot, entry.name);
      const messages = {};
      for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.json'))) {
        Object.assign(messages, flatten(JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'))));
      }
      return [entry.name, messages];
    }),
);

const staticKeys = new Map();
const keyPattern = /\bt\(\s*['"]([^'"]+)['"]/g;

for (const sourceFile of collectSourceFiles(sourceRoot)) {
  const source = fs.readFileSync(sourceFile, 'utf8');
  for (const match of source.matchAll(keyPattern)) {
    const files = staticKeys.get(match[1]) ?? [];
    files.push(path.relative(frontendRoot, sourceFile));
    staticKeys.set(match[1], files);
  }
}

let failed = false;
for (const [key, files] of staticKeys) {
  const hasMessage = key in locales.ro
    || Object.keys(locales.ro).some((messageKey) => messageKey.startsWith(`${key}_`));
  if (!hasMessage) {
    failed = true;
    console.error(`Romanian translation missing: "${key}" (used by ${files.join(', ')})`);
  }
}

if (failed) process.exitCode = 1;
else {
  console.log(
    `i18n audit passed: ${Object.keys(locales.ro).length} Romanian messages cover `
    + `${staticKeys.size} static translation keys.`,
  );
}
