import { motion as Motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import RevealCard from './cards/RevealCard';
import SectionTitle from './SectionTitle';
import { usePresentationContent } from '../data/usePresentationContent';

export default function Innovation() {
  const { innovation, serviceHighlights, siteImages, wireeoControls } = usePresentationContent();

  return (
    <AnimatedSection id="wireeo" className="relative overflow-hidden bg-ink py-24 text-white">
      <div className="absolute inset-0 bg-tech-grid bg-[length:50px_50px] opacity-10" />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-emerald/10 diagonal-bottom" />
      <div className="section-shell container-px relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionTitle
            kicker={innovation.kicker}
            title={innovation.title}
            copy={innovation.copy}
            light
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {serviceHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <RevealCard
                  className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur"
                  index={index}
                  y={24}
                  key={item.title}
                >
                  <Icon className="mb-4 text-orange" size={25} />
                  <h3 className="font-black uppercase text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                </RevealCard>
              );
            })}
          </div>
          <a href="/servicii/cercetare-si-inovare" className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-white hover:text-ink">
            {innovation.cta}
            <ArrowRight size={17} />
          </a>
        </div>

        <div className="relative min-h-[560px]">
          <div className="mb-6 flex flex-wrap gap-4 lg:absolute lg:-top-2 lg:right-0 lg:z-20">
            <img className="h-14 rounded-lg bg-white p-3 shadow-xl shadow-black/20" src={siteImages.wireeoLogo} alt="Wireeo" loading="lazy" />
            <img className="h-14 rounded-lg bg-white p-3 shadow-xl shadow-black/20" src={siteImages.istopLogo} alt="I-STOP" loading="lazy" />
          </div>
          <Motion.div
            className="absolute left-0 top-10 hidden h-[430px] w-[260px] rounded-[2rem] border border-white/15 bg-white p-3 shadow-2xl shadow-black/30 md:block"
            initial={{ opacity: 0, x: 40, rotate: -4 }}
            whileInView={{ opacity: 1, x: 0, rotate: -4 }}
            viewport={{ once: true }}
            animate={{ y: [0, -12, 0] }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className="h-full rounded-[1.55rem] bg-fog p-5 text-graphite">
              <div className="mx-auto mb-8 h-1.5 w-20 rounded-full bg-slate-200" />
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald">{innovation.mobileLabel}</p>
              <h3 className="mt-2 text-2xl font-black uppercase">{innovation.mobileTitle}</h3>
              <div className="mt-8 space-y-4">
                {wireeoControls.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="rounded-lg bg-white p-4 shadow-sm" key={item.label}>
                      <div className="flex items-center justify-between">
                        <Icon className="text-emerald" size={20} />
                        <span className="text-sm font-black text-orange">{item.value}</span>
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-600">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Motion.div>

          <Motion.div
            className="relative ml-auto rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/35 backdrop-blur-xl lg:w-[82%]"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="rounded-lg bg-white p-6 text-graphite">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald">{innovation.buildingOs}</p>
                  <h3 className="mt-2 text-3xl font-black uppercase">{innovation.realtimeControl}</h3>
                </div>
                <div className="rounded-full bg-emerald/10 px-4 py-2 text-sm font-black text-emerald">{innovation.online}</div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {wireeoControls.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <RevealCard
                      className="rounded-lg border border-emerald/10 bg-fog p-4"
                      index={index}
                      key={item.label}
                    >
                      <Icon className="mb-5 text-emerald" />
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-1 text-xl font-black">{item.value}</p>
                    </RevealCard>
                  );
                })}
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
}
