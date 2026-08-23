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

test('Romanian localization maps unique feature cards and copy for all 31 deck pages', async () => {
  const { localizeDeckPageRo, roPageData } = await import('./roDeckPages.js');
  const { createPublicRegistry } = await import('./publicPageRegistry.js');

  const allSections = ['technology', 'buildings', 'solutions'];
  const seenFeatureSignatures = new Set();

  for (const section of allSections) {
    for (const page of deck[section]) {
      assert.ok(roPageData[page.slug], `Missing roPageData for slug: ${page.slug}`);
      const localized = localizeDeckPageRo(page);

      assert.equal(localized.language, 'ro');
      assert.ok(localized.title && localized.title.length > 0);
      assert.ok(localized.supportingHeadline && localized.supportingHeadline.length > 0);
      assert.ok(localized.heroDescription && localized.heroDescription.length > 0);
      assert.ok(localized.resultLine && localized.resultLine.length > 0);
      assert.equal(localized.features.length, 6, `Page ${page.slug} must have exactly 6 features`);

      for (const feature of localized.features) {
        assert.ok(feature.title, `Feature title missing on ${page.slug}`);
        assert.ok(feature.description, `Feature description missing on ${page.slug}`);
        assert.ok(feature.icon, `Feature icon missing on ${page.slug}`);
      }

      // Ensure that different pages do not share the exact same 6 cards
      const signature = localized.features.map((f) => f.title).join('|');
      assert.ok(!seenFeatureSignatures.has(signature), `Duplicate features detected for page ${page.slug}`);
      seenFeatureSignatures.add(signature);
    }
  }

  // Verify public registry in Romanian
  const roRegistry = createPublicRegistry({
    technology: deck.technology.map(localizeDeckPageRo),
    buildings: deck.buildings.map(localizeDeckPageRo),
    solutions: deck.solutions.map(localizeDeckPageRo),
  });

  for (const section of allSections) {
    for (const page of deck[section]) {
      const detail = roRegistry[section].find((item) => item.slug === page.slug && item.category === section);
      assert.ok(detail, `Registry item not found for ${page.slug}`);
      assert.equal(detail.tabs.length, 4);

      const includedTab = detail.tabs.find((t) => t.id === 'what-is-included');
      assert.ok(includedTab);
      assert.ok(includedTab.bullets.length >= 4);

      // Verify that the first bullet contains the localized page's first feature title
      const localized = localizeDeckPageRo(page);
      assert.ok(includedTab.bullets[0].includes(localized.features[0].title));
    }
  }
});

