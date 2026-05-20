import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Home,
  Lightbulb,
  Lock,
  Smartphone,
  ThermometerSun,
  Wifi,
  Zap,
} from 'lucide-react';
import { usePresentationContent } from '../data/usePresentationContent';
import SiteImage from './SiteImage';

const dashboardIcons = [Lightbulb, ThermometerSun, Lock, BatteryCharging];

export default function HeroSlider() {
  const { hero, heroSlides, siteImages } = usePresentationContent();
  const [active, setActive] = useState(0);
  const slide = heroSlides[active];
  const SlideIcon = slide.icon;
  const dashboardItems = hero.dashboardItems.map((item, index) => ({
    ...item,
    icon: dashboardIcons[index],
  }));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 6800);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const move = (direction) => {
    setActive((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  return (
    <section id="acasa" className="green-wave relative min-h-screen overflow-hidden bg-ink pb-20 text-white">
      <AnimatePresence mode="wait">
        <Motion.div
          className="absolute inset-0"
          key={slide.image}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <SiteImage src={slide.image} alt={slide.title} className="absolute inset-0" />
        </Motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[rgba(3,18,13,0.72)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest via-ink/82 to-ink/45" />
      <div className="absolute inset-0 bg-tech-grid bg-[length:58px_58px] opacity-15" />
      <Motion.div
        className="absolute -right-36 top-20 h-[520px] w-[520px] rounded-full bg-orange/20 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-px relative z-10 mx-auto flex min-h-screen max-w-7xl items-center pt-32">
        <div className="grid w-full gap-14 lg:grid-cols-[1fr_520px] lg:items-center">
          <AnimatePresence mode="wait">
            <Motion.div
              key={slide.title}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <Motion.div
                className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.26em] text-white backdrop-blur"
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              >
                <SlideIcon size={16} className="text-orange" />
                {slide.eyebrow}
              </Motion.div>
              <Motion.h1
                className="max-w-4xl text-5xl font-black uppercase leading-none sm:text-7xl lg:text-[5.4rem]"
                variants={{ hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }}
              >
                {slide.title}
              </Motion.h1>
              <Motion.p
                className="mt-7 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl"
                variants={{ hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }}
              >
                {slide.text}
              </Motion.p>
              <Motion.div
                className="mt-8 flex flex-wrap gap-2.5"
                variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
              >
                {hero.stats.map((item) => (
                  <span key={item} className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/75 backdrop-blur">
                    {item}
                  </span>
                ))}
              </Motion.div>
              <Motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
              >
                <a
                  href={slide.href}
                  className="group inline-flex items-center gap-3 rounded-full bg-orange px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-white hover:text-ink"
                >
                  {slide.button}
                  <ArrowRight size={18} className="transition group-hover:translate-x-1.5" />
                </a>
                <a
                  href="/portofoliu"
                  className="rounded-full border border-white/25 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/90 transition hover:border-white hover:bg-white hover:text-ink"
                >
                  {hero.portfolio}
                </a>
              </Motion.div>
            </Motion.div>
          </AnimatePresence>

          <Motion.div
            className="relative hidden min-h-[610px] lg:block"
            initial={{ opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <Motion.div
              className="absolute inset-x-4 top-10 h-[390px] overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <SiteImage src={siteImages.smartInterior} alt="Smart home interior" className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">
                {hero.liveLabel}
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="mb-4 flex items-center justify-between rounded-lg border border-white/15 bg-white/12 p-4 backdrop-blur-xl">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-orange">{slide.accent}</p>
                    <p className="mt-1 text-2xl font-black uppercase">{hero.centralizedControl}</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-white shadow-glow">
                    <Wifi size={22} />
                  </span>
                </div>
              </div>
            </Motion.div>

            <Motion.div
              className="absolute right-0 top-0 w-[285px] rounded-[1.75rem] border border-white/18 bg-ink/82 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
              animate={{ y: [0, 18, 0] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-5">
                <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-white/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-orange">Wireeo</p>
                    <h3 className="mt-1 text-2xl font-black uppercase">Control</h3>
                  </div>
                  <Smartphone className="text-emerald" size={24} />
                </div>
                <div className="mt-7 space-y-3">
                  {dashboardItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Motion.div
                        className="rounded-lg border border-white/10 bg-white/10 p-4"
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="text-emerald" size={20} />
                          <span className="text-sm font-black text-orange">{item.value}</span>
                        </div>
                        <p className="mt-3 text-sm font-bold text-white/68">{item.label}</p>
                      </Motion.div>
                    );
                  })}
                </div>
              </div>
            </Motion.div>

            <Motion.div
              className="absolute bottom-24 left-2 w-[330px] rounded-lg border border-white/15 bg-white/12 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald text-white">
                    <Home size={20} />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange">{hero.monitorLabel}</p>
                    <p className="font-black">{hero.monitorTitle}</p>
                  </div>
                </div>
                <Zap className="text-orange" size={22} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {dashboardItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="rounded-lg border border-white/10 bg-white/10 p-4" key={item.label}>
                      <Icon className="mb-4 text-emerald" size={20} />
                      <p className="text-xs text-white/60">{item.label}</p>
                      <p className="text-xl font-black">{item.value}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-full bg-white/12 p-1.5">
                <Motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald to-orange"
                  initial={{ width: '20%' }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.4, delay: 0.4 }}
                />
              </div>
            </Motion.div>
          </Motion.div>
        </div>
      </div>

      <div className="container-px absolute bottom-12 left-0 right-0 z-20 mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex gap-2.5">
          {heroSlides.map((item, index) => (
            <button
              className={`rounded-full transition-all ${
                index === active ? 'h-2.5 w-10 bg-orange shadow-orange' : 'h-2.5 w-2.5 bg-white/40 hover:bg-white'
              }`}
              onClick={() => setActive(index)}
              aria-label={`Slide ${index + 1}: ${item.title}`}
              key={item.title}
            />
          ))}
        </div>
        <div className="flex gap-2.5">
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-orange" onClick={() => move(-1)} aria-label={hero.previousSlide}>
            <ArrowLeft size={18} />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-orange" onClick={() => move(1)} aria-label={hero.nextSlide}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

