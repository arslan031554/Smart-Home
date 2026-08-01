import { Navigate, useParams } from 'react-router-dom';
import DeckPageTemplate from '../components/DeckPageTemplate';
import {
  buildingPages,
  findDeckPage,
  solutionPages,
  technologyPages,
} from '../data/deckContent';
import { localizeDeckPageRo } from '../data/roDeckPages';
import { useTranslation } from 'react-i18next';

export default function DeckContentPage({ section }) {
  const { i18n } = useTranslation();
  const { slug } = useParams();
  const basePage = findDeckPage(section, slug);

  if (!basePage) return <Navigate to="/" replace />;
  const page = i18n.language?.startsWith('ro') ? localizeDeckPageRo(basePage) : basePage;

  const collection = section === 'technology'
    ? technologyPages
    : section === 'buildings'
      ? buildingPages
      : solutionPages;
  const pageIndex = collection.findIndex((item) => item.slug === slug);

  return <DeckPageTemplate page={page} pageIndex={pageIndex} />;
}
