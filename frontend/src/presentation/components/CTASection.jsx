import { ArrowRight } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export default function CTASection({
  kicker = 'Hai sa incepem',
  title = 'Transforma cladirea intr-un spatiu inteligent',
  copy = 'Echipa Green Electric Innovations proiecteaza si implementeaza solutii premium pentru confort, control si eficienta energetica.',
  button = 'Solicita o oferta',
}) {
  return (
    <section className="relative overflow-hidden bg-emerald py-14 text-ink sm:py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-ink/5" />
      <div className="section-shell container-px relative">
        <Motion.div
          className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/65">{kicker}</span>
            <h2 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-5xl">{title}</h2>
            <p className="mt-3 text-base leading-7 text-ink/70">{copy}</p>
          </div>
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-white hover:text-ink"
          >
            {button}
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </a>
        </Motion.div>
      </div>
    </section>
  );
}
