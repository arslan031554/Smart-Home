import Contact from '../components/Contact';
import PageHero from '../components/PageHero';
import { usePresentationContent } from '../data/usePresentationContent';

export default function ContactPage() {
  const { pages, siteImages } = usePresentationContent();

  return (
    <>
      <PageHero
        title={pages.contact.title}
        eyebrow={pages.contact.eyebrow}
        breadcrumb={pages.contact.breadcrumb}
        image={siteImages.heroEnergy}
      />
      <div id="page-content">
        <Contact />
      </div>
    </>
  );
}
