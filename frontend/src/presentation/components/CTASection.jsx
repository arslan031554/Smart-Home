import { ArrowRight } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export default function CTASection({
  kicker = 'Hai sa incepem',
  title = 'Transforma cladirea intr-un spatiu inteligent',
  copy = 'Echipa Green Electric City proiecteaza si implementeaza solutii premium pentru confort, control si eficienta energetica.',
  button = 'Solicita o oferta',
}) {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white">
      <div className="absolute inset-0 bg-tech-grid bg-[length:48px_48px] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald/25 via-transparent to-orange/15" />
      <div className="section-shell container-px relative">
        <Motion.div
          className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-[0.26em] text-orange">{kicker}</span>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-5xl">{title}</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">{copy}</p>
          </div>
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-orange px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-white hover:text-ink"
          >
            {button}
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </a>
        </Motion.div>
      </div>
    </section>
  );
}
