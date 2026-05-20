import About from '../components/About';
import CTA from '../components/CTA';
import PageHero from '../components/PageHero';
import Stats from '../components/Stats';
import { usePresentationContent } from '../data/usePresentationContent';

export default function AboutPage() {
  const { pages, siteImages } = usePresentationContent();

  return (
    <>
      <PageHero
        title={pages.about.title}
        eyebrow={pages.about.eyebrow}
        breadcrumb={pages.about.breadcrumb}
        image={siteImages.about}
      />
      <About />
      <Stats />
      <CTA />
    </>
  );
}
