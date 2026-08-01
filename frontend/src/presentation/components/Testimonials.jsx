import { motion as Motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { testimonials } from '../data/siteData';
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();
  return (
    <AnimatedSection className="relative overflow-hidden bg-fog py-24">
      {/* Subtle green accent */}
      <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald/8 blur-3xl" />

      <div className="section-shell container-px relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">{t('presentation.testimonials.kicker', { defaultValue: 'Testimonials' })}</span>
          <h2 className="section-title mt-4">{t('presentation.testimonials.title', { defaultValue: 'What our clients say' })}</h2>
          <p className="section-copy mt-5">
            {t('presentation.testimonials.copy', { defaultValue: 'Over 180 projects delivered — see what clients who chose Green Electric Innovations for their intelligent homes and offices say.' })}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <Motion.div
              key={t.name}
              className="gradient-border rounded-2xl bg-white p-7 shadow-xl shadow-slate-200/70"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Stars */}
              <div className="mb-5 flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-emerald text-emerald" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote className="mb-4 text-emerald/30" size={32} />

              {/* Text */}
              <p className="text-sm leading-7 text-slate-600">"{t.text}"</p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald text-ink text-lg font-black">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-ink">{t.name}</p>
                  <p className="text-xs font-semibold text-slate-400">
                    {t.role} · {t.location}
                  </p>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
