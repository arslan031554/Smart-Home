import CTASection from './CTASection';
import { usePresentationContent } from '../data/usePresentationContent';

export default function CTA() {
  const { cta } = usePresentationContent();

  return (
    <CTASection
      kicker={cta.kicker}
      title={cta.title}
      copy={cta.copy}
      button={cta.button}
    />
  );
}
