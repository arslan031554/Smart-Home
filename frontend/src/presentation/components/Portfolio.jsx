import { useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import PortfolioCard from './PortfolioCard';
import SectionTitle from './SectionTitle';
import { usePresentationContent } from '../data/usePresentationContent';

export default function Portfolio() {
  const { portfolio, projects } = usePresentationContent();
  const [filter, setFilter] = useState('all');
  const categories = portfolio.categories;
  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((project) => project.categoryKey === filter)),
    [filter, projects],
  );

  return (
    <AnimatedSection id="portofoliu" className="bg-fog py-24">
      <div className="section-shell container-px">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionTitle
            kicker={portfolio.kicker}
            title={portfolio.title}
            copy={portfolio.copy}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  filter === category.key ? 'bg-ink text-white shadow-glow' : 'bg-white text-slate-600 hover:bg-emerald hover:text-white'
                }`}
                onClick={() => setFilter(category.key)}
                key={category.key}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <Motion.div className="mt-12 grid gap-7 lg:grid-cols-2" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <PortfolioCard project={project} index={index} key={project.title} />
            ))}
          </AnimatePresence>
        </Motion.div>
      </div>
    </AnimatedSection>
  );
}

