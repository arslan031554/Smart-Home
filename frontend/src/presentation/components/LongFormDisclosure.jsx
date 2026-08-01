import { motion as Motion, useReducedMotion } from 'framer-motion';

export default function LongFormDisclosure({
  paragraphs = [],
  title = 'Read the complete page information',
  className = '',
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Motion.div
      className={`overflow-hidden rounded-[1.25rem] border border-emerald/15 bg-white shadow-soft ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <h3 className="text-base font-semibold text-graphite mb-5">{title}</h3>
        <div className="scrollable-disclosure border-t border-emerald/10 -mx-5 -mb-6 -ml-5 -mr-5 px-5 py-6 sm:-mx-7 sm:-mb-8 sm:-ml-7 sm:-mr-7 sm:px-7 sm:py-8">
          <div className="space-y-5">
            {paragraphs.map((paragraph) => (
              <p className="max-w-[78ch]" key={paragraph.slice(0, 80)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
