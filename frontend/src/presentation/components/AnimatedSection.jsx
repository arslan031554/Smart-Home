import { motion as Motion } from 'framer-motion';

const revealVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AnimatedSection({ children, className = '', delay = 0, id }) {
  return (
    <Motion.section
      id={id}
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ delay }}
    >
      {children}
    </Motion.section>
  );
}
