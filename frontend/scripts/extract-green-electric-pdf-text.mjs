import fs from 'node:fs';
import zlib from 'node:zlib';

function ascii85Decode(input) {
  const clean = String(input)
    .replace(/^<~/, '')
    .replace(/~>$/, '')
    .replace(/\s+/g, '');
  const bytes = [];
  let group = [];

  for (const char of clean) {
    if (char === 'z' && group.length === 0) {
      bytes.push(0, 0, 0, 0);
      continue;
    }

    const code = char.charCodeAt(0);
    if (code < 33 || code > 117) continue;
    group.push(code - 33);

    if (group.length === 5) {
      let value = 0;
      group.forEach((digit) => { value = value * 85 + digit; });
      bytes.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
      group = [];
    }
  }

  if (group.length > 0) {
    const missing = 5 - group.length;
    for (let index = 0; index < missing; index += 1) group.push(84);
    let value = 0;
    group.forEach((digit) => { value = value * 85 + digit; });
    const tail = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
    bytes.push(...tail.slice(0, 4 - missing));
  }

  return Buffer.from(bytes);
}

function decodeStream(dictionary, content) {
  if (/\/Subtype\s*\/Image/.test(dictionary) || /\/DCTDecode/.test(dictionary)) return null;

  let buffer = Buffer.from(content, 'latin1');
  const filters = [...dictionary.matchAll(/\/([A-Za-z0-9]+Decode)/g)].map((match) => match[1]);

  try {
    for (const filter of filters) {
      if (filter === 'ASCII85Decode') buffer = ascii85Decode(buffer.toString('latin1'));
      if (filter === 'FlateDecode') buffer = zlib.inflateSync(buffer);
    }
  } catch {
    return null;
  }

  return buffer.toString('latin1');
}

function decodePdfString(value) {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== '\\') {
      result += char;
      continue;
    }

    index += 1;
    const next = value[index];
    if (next === 'n') result += '\n';
    else if (next === 'r') result += '\r';
    else if (next === 't') result += '\t';
    else if (next === 'b') result += '\b';
    else if (next === 'f') result += '\f';
    else if (next === '(' || next === ')' || next === '\\') result += next;
    else if (/[0-7]/.test(next || '')) {
      let octal = next;
      for (let offset = 0; offset < 2 && /[0-7]/.test(value[index + 1] || ''); offset += 1) {
        index += 1;
        octal += value[index];
      }
      result += String.fromCharCode(Number.parseInt(octal, 8));
    } else if (next) {
      result += next;
    }
  }
  return result;
}

function extractTextFromContent(content) {
  const chunks = [];
  const tokenPattern = /\((?:\\.|[^\\)])*\)\s*Tj|\[(.*?)\]\s*TJ/gms;
  let match;
  while ((match = tokenPattern.exec(content))) {
    const token = match[0];
    if (token.endsWith('Tj')) {
      const stringMatch = token.match(/^\((.*)\)\s*Tj$/s);
      if (stringMatch) chunks.push(decodePdfString(stringMatch[1]));
      continue;
    }

    const arrayBody = match[1] || '';
    const stringPattern = /\((?:\\.|[^\\)])*\)/gms;
    let stringMatch;
    let line = '';
    while ((stringMatch = stringPattern.exec(arrayBody))) {
      line += decodePdfString(stringMatch[0].slice(1, -1));
    }
    if (line) chunks.push(line);
  }

  return chunks
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function extractPdfText(path) {
  const raw = fs.readFileSync(path).toString('latin1');
  const streamPattern = /(<<[\s\S]*?>>)\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const pages = [];
  let match;
  while ((match = streamPattern.exec(raw))) {
    const content = decodeStream(match[1], match[2]);
    if (!content) continue;
    const text = extractTextFromContent(content);
    if (text.length > 4) pages.push(text);
  }
  return pages;
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/extract-green-electric-pdf-text.mjs <pdf> [...]');
  process.exit(1);
}

files.forEach((file) => {
  const pages = extractPdfText(file);
  console.log(`\n===== ${file} =====`);
  pages.forEach((page, index) => {
    console.log(`\n--- page ${index + 1} ---`);
    console.log(page.join('\n'));
  });
});