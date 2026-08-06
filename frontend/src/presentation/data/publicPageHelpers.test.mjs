import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import {
  CONTACT_SERVICE_PREFILLS,
  DEFAULT_TAB_ID,
  getAccordionState,
  getAdjacentTabId,
  getContactPrefill,
  getPagerState,
  normalizeServiceParam,
  TAB_IDS,
} from './publicPageHelpers.js';

const require = createRequire(import.meta.url);
const deck = require('./greenElectricDeck.json');

test('detail tabs default and keyboard order stay stable', () => {
  assert.equal(DEFAULT_TAB_ID, 'how-it-works');
  assert.deepEqual(TAB_IDS, ['how-it-works', 'what-is-included', 'key-benefits', 'project-applications']);
  assert.equal(getAdjacentTabId('how-it-works', 'next'), 'what-is-included');
  assert.equal(getAdjacentTabId('what-is-included', 'previous'), 'how-it-works');
  assert.equal(getAdjacentTabId('project-applications', 'next'), 'how-it-works');
});

test('mobile accordion allows at most one open section', () => {
  assert.equal(getAccordionState('how-it-works', 'key-benefits'), 'key-benefits');
  assert.equal(getAccordionState('key-benefits', 'key-benefits'), null);
});

test('technology pager follows actual menu order and boundaries', () => {
  const items = deck.technology;
  const first = getPagerState(items, 'lighting', '/technology');
  const middle = getPagerState(items, 'climate-control', '/technology');
  const last = getPagerState(items, 'security', '/technology');

  assert.equal(first.previous, null);
  assert.equal(first.next.slug, 'shading');
  assert.equal(middle.previous.slug, 'shading');
  assert.equal(middle.next.slug, 'ventilation');
  assert.equal(last.previous.slug, 'irrigation');
  assert.equal(last.next, null);
  assert.equal(middle.overviewRoute, '/technology');
});

test('building and solution pagers preserve registry order', () => {
  const building = getPagerState(deck.buildings, 'offices', '/buildings');
  const solution = getPagerState(deck.solutions, 'implementation', '/solutions');

  assert.equal(building.previous.slug, 'real-estate-developments');
  assert.equal(building.next.slug, 'hotels');
  assert.equal(solution.previous.slug, 'design');
  assert.equal(solution.next.slug, 'maintenance');
});

test('contact prefill accepts only supported service values', () => {
  assert.equal(normalizeServiceParam('design'), 'design');
  assert.equal(normalizeServiceParam(' MAINTENANCE '), 'maintenance');
  assert.equal(normalizeServiceParam('unknown'), null);
  assert.equal(getContactPrefill('implementation').message, CONTACT_SERVICE_PREFILLS.implementation);
  assert.equal(getContactPrefill('unknown'), null);
});

test('all overview cards point to real registered routes', () => {
  for (const section of ['technology', 'buildings', 'solutions']) {
    for (const item of deck[section]) {
      assert.ok(item.route.startsWith(`/${section === 'technology' ? 'technology' : section}/`));
      assert.ok(item.slug);
      assert.ok(item.menuLabel);
    }
  }
});
