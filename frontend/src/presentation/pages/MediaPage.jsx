import Media from '../components/Media';
import PageHero from '../components/PageHero';
import { usePresentationContent } from '../data/usePresentationContent';

export default function MediaPage() {
  const { pages, siteImages } = usePresentationContent();

  return (
    <>
      <PageHero
        title={pages.media.title}
        eyebrow={pages.media.eyebrow}
        breadcrumb={pages.media.breadcrumb}
        image={siteImages.heroControl}
      />
      <Media />
    </>
  );
}
