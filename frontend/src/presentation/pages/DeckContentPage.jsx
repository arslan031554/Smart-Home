import { Navigate, useParams } from 'react-router-dom';
import DeckPageTemplate from '../components/DeckPageTemplate';
import {
  buildingPages,
  findDeckPage,
  solutionPages,
  technologyPages,
} from '../data/deckContent';
import { createPublicRegistry, findPublicPage } from '../data/publicPageRegistry';
import { localizeDeckPageRo } from '../data/roDeckPages';
import { useTranslation } from 'react-i18next';

export default function DeckContentPage({ section }) {
  const { i18n } = useTranslation();
  const { slug } = useParams();
  const basePage = findDeckPage(section, slug);

  if (!basePage) return <Navigate to="/" replace />;
  const localize = (page) => i18n.language?.startsWith('ro') ? localizeDeckPageRo(page) : page;
  const page = localize(basePage);

  const collection = section === 'technology'
    ? technologyPages
    : section === 'buildings'
      ? buildingPages
      : solutionPages;
  const pageIndex = collection.findIndex((item) => item.slug === slug);
  const registry = createPublicRegistry({
    technology: technologyPages.map(localize),
    buildings: buildingPages.map(localize),
    solutions: solutionPages.map(localize),
  });
  const detailPage = findPublicPage(section, slug, registry);

  return <DeckPageTemplate page={page} detailPage={detailPage} registry={registry} pageIndex={pageIndex} />;
}
