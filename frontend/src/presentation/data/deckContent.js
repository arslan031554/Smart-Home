import deck from './greenElectricDeck.json' with { type: 'json' };
const smartHomeImage = new URL('../../assets/12.JPG', import.meta.url).href;
const smartSystemsImage = new URL('../../assets/13.jfif', import.meta.url).href;
const mobileControlImage = new URL('../../assets/14.jfif', import.meta.url).href;

export const greenElectricDeck = deck;

export const technologyPages = deck.technology;
export const buildingPages = deck.buildings;
export const solutionPages = deck.solutions;

export const deckNavigation = [
  { key: 'technology', label: 'Technology', items: technologyPages },
  { key: 'buildings', label: 'Buildings & Destinations', items: buildingPages },
  { key: 'solutions', label: 'Solutions', items: solutionPages },
];

const imagePool = [smartHomeImage, smartSystemsImage, mobileControlImage];

export function getPageImage(page, index = 0) {
  if (page?.section === 'technology') return imagePool[index % imagePool.length];
  if (page?.section === 'buildings') return imagePool[(index + 1) % imagePool.length];
  if (page?.section === 'solutions') return imagePool[(index + 2) % imagePool.length];
  return imagePool[index % imagePool.length];
}

export function findDeckPage(section, slug) {
  const collection = section === 'technology'
    ? technologyPages
    : section === 'buildings'
      ? buildingPages
      : solutionPages;
  return collection.find((page) => page.slug === slug);
}

export function stripDeckCtaArrow(label = '') {
  return label.replace(/\s*->\s*$/, '').replace(/\s*→\s*$/, '').trimEnd();
}

export const homeBuildingRoutes = {
  Home: '/buildings/home',
  Offices: '/buildings/offices',
  'Hotel & Horeca': '/buildings/hotels',
  Hospital: '/buildings/hospitals',
  Factory: '/buildings/factories',
  Warehouse: '/buildings/warehouses',
  Parking: '/buildings/parking',
};
