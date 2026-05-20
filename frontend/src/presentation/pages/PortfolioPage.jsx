import CTA from '../components/CTA';
import PageHero from '../components/PageHero';
import Portfolio from '../components/Portfolio';
import { usePresentationContent } from '../data/usePresentationContent';

export default function PortfolioPage() {
  const { pages, siteImages } = usePresentationContent();

  return (
    <>
      <PageHero
        title={pages.portfolio.title}
        eyebrow={pages.portfolio.eyebrow}
        breadcrumb={pages.portfolio.breadcrumb}
        image={siteImages.casaBuhnici}
      />
      <Portfolio />
      <CTA />
    </>
  );
}
