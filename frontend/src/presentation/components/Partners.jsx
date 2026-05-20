import { motion as Motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import { partners } from '../data/siteData';

export default function Partners() {
  return (
    <AnimatedSection className="relative overflow-hidden border-y border-emerald/12 bg-ink/95 py-16">
      <div className="absolute inset-0 bg-tech-grid bg-[length:44px_44px] opacity-[0.06]" />
      <div className="section-shell container-px relative">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-emerald/80">
            Parteneri & Certificări
          </p>
          <p className="mt-2 text-sm font-semibold text-white/45">
            Lucrăm cu cele mai recunoscute branduri în automatizarea clădirilor
          </p>
        </div>

        {/* Partner logos row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {partners.map((partner, index) => (
            <Motion.div
              key={partner.name}
              className="group flex min-w-[130px] flex-col items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] px-6 py-5 transition hover:border-emerald/30 hover:bg-emerald/8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <span className="text-xl font-black tracking-wide text-white/70 transition group-hover:text-emerald">
                {partner.name}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 transition group-hover:text-emerald/60">
                {partner.subtitle}
              </span>
            </Motion.div>
          ))}
        </div>

        {/* KNX Certification highlight */}
        <Motion.div
          className="mx-auto mt-10 flex max-w-2xl items-center gap-5 rounded-2xl border border-emerald/20 bg-emerald/8 p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-emerald/30 bg-emerald/15 text-2xl font-black text-emerald">
            KNX
          </div>
          <div>
            <p className="font-black text-white">Certificat KNX — Standardul Mondial în Automatizare</p>
            <p className="mt-1 text-sm leading-6 text-white/60">
              Echipa noastră este certificată KNX, garantând implementări conform celor mai stricte standarde internaționale de automatizare a clădirilor.
            </p>
          </div>
        </Motion.div>
      </div>
    </AnimatedSection>
  );
}
