import { useEffect, useRef, useState } from 'react';
import AnimatedSection from './AnimatedSection';
import { usePresentationContent } from '../data/usePresentationContent';

function Counter({ stat }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const Icon = stat.icon;
  const numericValue = typeof stat.value === 'number' ? stat.value : null;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStarted(true);
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || stat.textValue || numericValue === null) return;
    let frame = 0;
    const frames = 72;
    const tick = () => {
      frame += 1;
      const p = Math.min(frame / frames, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(numericValue * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, stat, numericValue]);

  return (
    <div ref={ref} className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-7 text-center transition hover:-translate-y-1 hover:border-emerald/40 hover:bg-white/12">
      <div className="absolute inset-0 rounded-[1.5rem] bg-emerald/5 opacity-0 transition group-hover:opacity-100" />
      <div className="relative">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald/20 bg-emerald/10">
          {Icon ? <Icon className="text-emerald" size={28} /> : <span className="text-emerald text-2xl">•</span>}
        </div>
        <div className="text-5xl font-black text-white sm:text-6xl">
          {stat.textValue ?? (numericValue === null ? stat.value : count)}
          {numericValue !== null && !stat.textValue && stat.suffix && <span className="text-orange">{stat.suffix}</span>}
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-white/65">{stat.label}</p>
      </div>
    </div>
  );
}

export default function Stats({ stats: overrideStats, statsSection: overrideStatsSection }) {
  const { stats: defaultStats, statsSection: defaultStatsSection } = usePresentationContent();
  const stats = overrideStats || defaultStats;
  const statsSection = overrideStatsSection || defaultStatsSection;

  return (
    <AnimatedSection className="relative overflow-hidden bg-ink py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald/15 via-transparent to-orange/10" />
      <div className="absolute inset-0 bg-tech-grid bg-[length:48px_48px] opacity-[0.08]" />
      <div className="section-shell container-px relative">
        {(statsSection?.kicker || statsSection?.title) && (
          <div className="mb-12 text-center">
            {statsSection.kicker && <span className="section-kicker">{statsSection.kicker}</span>}
            {statsSection.title && <h2 className="mt-4 text-3xl font-black uppercase text-white sm:text-4xl">{statsSection.title}</h2>}
          </div>
        )}
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Counter stat={stat} key={stat.label} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
