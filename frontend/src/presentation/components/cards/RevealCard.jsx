import { memo } from 'react';
import { motion as Motion } from 'framer-motion';

function RevealCard({
  as = 'div',
  children,
  className = '',
  delay = 0,
  delayStep = 0.08,
  duration = 0.55,
  index = 0,
  layout = false,
  scale = 1,
  viewportAmount = 0.18,
  y = 28,
}) {
  const MotionTag = as === 'article' ? Motion.article : Motion.div;
  const hidden = scale === 1 ? { opacity: 0, y } : { opacity: 0, y, scale };
  const visible = scale === 1 ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 };

  return (
    <MotionTag
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{ duration, delay: delay + index * delayStep }}
      layout={layout}
    >
      {children}
    </MotionTag>
  );
}

export default memo(RevealCard);
