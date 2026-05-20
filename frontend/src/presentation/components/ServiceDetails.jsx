import { motion as Motion } from 'framer-motion';
import PageHero from './PageHero';
import CTASection from './CTASection';
import InfoCard from './cards/InfoCard';
import SectionTitle from './SectionTitle';
import SiteImage from './SiteImage';
import { usePresentationContent } from '../data/usePresentationContent';

export default function ServiceDetails({ serviceSlug }) {
  const { cta, pages, serviceDetails, serviceHighlights, services } = usePresentationContent();
  const renderedServices = serviceSlug
    ? services.filter((service) => service.slug === serviceSlug)
    : services;

  return (
    <div>
      {renderedServices.map((service, index) => {
        const Icon = service.icon;
        const isResearch = service.slug === 'cercetare-si-inovare';

        return (
          <section key={service.slug} id={service.slug}>
            <PageHero
              title={isResearch ? serviceDetails.researchTitle : service.title}
              eyebrow={serviceDetails.eyebrow}
              breadcrumb={[pages.services.breadcrumb[0], pages.services.title, service.title]}
              icon={Icon}
              image={service.image}
            />
            <div className="bg-white py-20">
              <div className="section-shell container-px grid items-center gap-12 lg:grid-cols-[0.92fr_1fr]">
                <Motion.div
                  className="relative min-h-[430px] overflow-hidden rounded-lg bg-ink shadow-2xl shadow-emerald/15"
                  initial={{ opacity: 0, x: -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65 }}
                >
                  <SiteImage src={service.image} alt={service.title} className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                  <div className="absolute bottom-7 left-7 right-7 rounded-lg border border-white/20 bg-white/15 p-5 text-white backdrop-blur">
                    <Icon className="mb-4 text-orange" size={34} />
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">{serviceDetails.brandLabel}</p>
                    <h3 className="mt-2 text-2xl font-black uppercase">{service.title}</h3>
                  </div>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65 }}
                >
                  <SectionTitle
                    kicker={isResearch ? serviceDetails.dedicatedPage : serviceDetails.specializedService}
                    title={service.title}
                    copy={service.text}
                  />
                  <p className="mt-5 text-base leading-8 text-slate-600">{service.detail}</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {service.chips.map((chip) => (
                      <div className="rounded-lg bg-fog p-4 text-sm font-black text-emerald" key={chip}>
                        {chip}
                      </div>
                    ))}
                  </div>
                </Motion.div>
              </div>

              {isResearch && (
                <div className="section-shell container-px mt-16">
                  <div className="grid gap-5 md:grid-cols-3">
                    {serviceHighlights.map((item, highlightIndex) => {
                      return (
                        <InfoCard
                          className="rounded-lg border border-emerald/10 bg-fog p-6 shadow-lg shadow-emerald/10"
                          icon={item.icon}
                          iconWrapClassName="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white"
                          key={item.title}
                          index={highlightIndex}
                          title={item.title}
                          titleClassName="text-xl font-black uppercase text-graphite"
                          text={item.text}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="section-shell container-px mt-16">
                <div className="rounded-lg bg-fog p-6">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald">{serviceDetails.related}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {services
                      .filter((item) => item.slug !== service.slug)
                      .slice(0, 4)
                      .map((item) => (
                        <a className="rounded-full bg-white px-4 py-2 text-sm font-bold text-graphite shadow-sm transition hover:bg-emerald hover:text-white" href={`/servicii/${item.slug}`} key={item.slug}>
                          {item.title}
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {index === renderedServices.length - 1 && (
              <CTASection
                kicker={serviceDetails.ctaKicker}
                title={serviceDetails.ctaTitle}
                copy={serviceDetails.ctaCopy}
                button={cta.button}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
