import { useId, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function ExpandableText({
  text,
  maxCharacters = 320,
  className = '',
  buttonClassName = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const contentId = useId();
  const shouldCollapse = text.length > maxCharacters;
  const preview = shouldCollapse
    ? `${text.slice(0, maxCharacters).trimEnd().replace(/[.,;:]?$/, '')}…`
    : text;

  return (
    <div className={className}>
      <AnimatePresence initial={false} mode="wait">
        <Motion.p
          id={contentId}
          key={expanded ? 'expanded' : 'collapsed'}
          initial={reduceMotion ? false : { opacity: 0.65 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0.65 }}
          transition={{ duration: 0.2 }}
        >
          {expanded ? text : preview}
        </Motion.p>
      </AnimatePresence>

      {shouldCollapse && (
        <button
          type="button"
          className={`mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald transition hover:text-ink ${buttonClassName}`}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} size={17} />
        </button>
      )}
    </div>
  );
}
