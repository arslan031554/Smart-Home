import { memo } from 'react';
import IconBubble from './IconBubble';
import RevealCard from './RevealCard';

function InfoCard({
  as = 'div',
  children,
  className = 'group h-full rounded-lg border border-emerald/10 bg-white p-6 shadow-xl shadow-emerald/10 transition hover:-translate-y-1 hover:border-emerald/35',
  delayStep = 0.08,
  href,
  icon,
  iconClassName,
  iconWrapClassName,
  index = 0,
  label,
  labelClassName = 'text-xs font-black uppercase tracking-[0.22em] text-slate-400',
  text,
  textClassName = 'mt-3 text-sm leading-7 text-slate-600',
  title,
  titleClassName = 'mt-2 text-lg font-black leading-7 text-graphite',
  topSlot,
}) {
  const content = (
    <RevealCard as={as} className={className} index={index} delayStep={delayStep}>
      {topSlot || (
        <IconBubble
          icon={icon}
          className={iconWrapClassName || 'mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-white shadow-glow transition group-hover:scale-110 group-hover:bg-orange'}
          iconClassName={iconClassName}
          size={23}
        />
      )}
      {label && <p className={labelClassName}>{label}</p>}
      {title && <h3 className={titleClassName}>{title}</h3>}
      {text && <p className={textClassName}>{text}</p>}
      {children}
    </RevealCard>
  );

  return href ? (
    <a href={href} className="block h-full">
      {content}
    </a>
  ) : content;
}

export default memo(InfoCard);
