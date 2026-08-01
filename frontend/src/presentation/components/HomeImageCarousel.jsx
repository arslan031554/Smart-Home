import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PresentationImage from './PresentationImage';
import { useTranslation } from 'react-i18next';

export default function HomeImageCarousel({ slides }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const reduceMotion = useReducedMotion();
  const paused = interacting;

  useEffect(() => {
    if (paused || reduceMotion || slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, slides.length]);

  const move = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  const slide = slides[active];

  return (
    <div
      className="home-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('presentation.carousel.label', { defaultValue: 'Smart building solutions' })}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
    >
      <div className="home-hero-frame relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-sm sm:rounded-[2.25rem] sm:p-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] sm:rounded-[1.85rem] lg:aspect-[5/4]">
          <AnimatePresence initial={false} mode="wait">
            <Motion.div
              className="absolute inset-0"
              key={slide.src}
              initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <PresentationImage
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 52vw, 92vw"
                eager={active === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/25 via-transparent to-transparent" />
            </Motion.div>
          </AnimatePresence>

          <div className="absolute inset-x-5 bottom-5 z-10 sm:inset-x-8 sm:bottom-8">
            <div className="max-w-md">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald">{slide.kicker}</p>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">{slide.title}</h2>
              <p className="mt-1 hidden text-sm leading-6 text-white/65 sm:block">{slide.copy}</p>
            </div>
          </div>

          <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-6 sm:top-6">
            <button className="home-carousel-control" type="button" onClick={() => move(-1)} aria-label={t('presentation.carousel.previous', { defaultValue: 'Previous image' })}>
              <ArrowLeft size={18} />
            </button>
            <button className="home-carousel-control" type="button" onClick={() => move(1)} aria-label={t('presentation.carousel.next', { defaultValue: 'Next image' })}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-3 sm:px-3">
          <div className="flex gap-2" role="tablist" aria-label={t('presentation.carousel.choose', { defaultValue: 'Choose carousel image' })}>
            {slides.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={t('presentation.carousel.show', { title: item.title, defaultValue: 'Show {{title}}' })}
                className={`h-2 rounded-full transition-all duration-300 ${active === index ? 'w-8 bg-emerald' : 'w-2 bg-white/25 hover:bg-white/50'}`}
                onClick={() => setActive(index)}
                key={item.src}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
