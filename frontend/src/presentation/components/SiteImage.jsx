import { useState } from 'react';

export default function SiteImage({ src, alt, className = '', overlay = true }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`smart-building-fallback ${className}`} aria-label={alt || 'Green Electric visual'}>
        <span />
        <span />
        <span />
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {overlay && <div className="absolute inset-0 bg-[rgba(3,18,13,0.46)]" />}
    </>
  );
}
