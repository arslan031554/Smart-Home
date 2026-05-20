import AnimatedSection from './AnimatedSection';
import SectionTitle from './SectionTitle';
import ServiceCard from './ServiceCard';
import { usePresentationContent } from '../data/usePresentationContent';

export default function Services() {
  const { services, servicesSection } = usePresentationContent();

  return (
    <AnimatedSection id="servicii" className="relative overflow-hidden bg-white py-24">
      <div className="absolute left-0 top-0 h-28 w-full bg-fog diagonal-bottom" />
      <div className="section-shell container-px relative pt-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <SectionTitle
            kicker={servicesSection.kicker}
            title={servicesSection.title}
            copy={servicesSection.copy}
          />
          <a href="/contact" className="shrink-0 rounded-full bg-orange px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-emerald">
            {servicesSection.cta}
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {servicesSection.features.map((feature) => (
            <span key={feature} className="rounded-full border border-emerald/20 bg-fog px-3 py-1.5 text-xs font-bold text-emerald">
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              service={service}
              index={index}
              learnMoreLabel={servicesSection.learnMore}
              key={service.title}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
