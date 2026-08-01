export default function SectionTitle({ kicker, title, copy, align = 'left', light = false }) {
  const centered = align === 'center';

  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {kicker && <span className="section-kicker">{kicker}</span>}
      <h2 className={light ? 'text-3xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl' : 'section-title'}>
        {title}
      </h2>
      {copy && (
        <p className={light ? 'mt-5 text-base leading-8 text-white/70 sm:text-lg' : 'section-copy mt-5'}>
          {copy}
        </p>
      )}
    </div>
  );
}
