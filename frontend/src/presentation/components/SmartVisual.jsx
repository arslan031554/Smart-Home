import { CircuitBoard } from 'lucide-react';

export default function SmartVisual({ image, label, className = '' }) {
  return (
    <div className={`image-fallback relative overflow-hidden rounded-lg ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-75 mix-blend-screen"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-tech-grid bg-[length:34px_34px] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-ink/70 via-ink/10 to-emerald/20" />
      <div className="relative flex h-full min-h-72 items-center justify-center p-8">
        <div className="tech-panel rounded-lg p-6 text-center">
          <CircuitBoard className="mx-auto mb-4 text-emerald" size={42} />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyanline">{label}</p>
        </div>
      </div>
    </div>
  );
}
