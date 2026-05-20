import CTA from '../components/CTA';
import PageHero from '../components/PageHero';
import Process from '../components/Process';
import Services from '../components/Services';
import { usePresentationContent } from '../data/usePresentationContent';

export default function ServicesPage() {
  const { pages, siteImages } = usePresentationContent();

  return (
    <>
      <PageHero
        title={pages.services.title}
        eyebrow={pages.services.eyebrow}
        breadcrumb={pages.services.breadcrumb}
        image={siteImages.heroHome}
      />
      <Services />
      <Process />
      <CTA />
    </>
  );
}
