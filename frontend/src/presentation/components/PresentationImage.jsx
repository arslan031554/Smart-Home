function sizedImage(src, width, quality = 80) {
  if (!src?.includes('images.unsplash.com')) return src;

  const url = new URL(src);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('w', width);
  url.searchParams.set('q', quality);
  return url.toString();
}

export default function PresentationImage({
  src,
  alt = '',
  className = '',
  eager = false,
  sizes = '100vw',
}) {
  const isResponsiveRemoteImage = src?.includes('images.unsplash.com');

  return (
    <img
      src={sizedImage(src, eager ? 1600 : 900)}
      srcSet={isResponsiveRemoteImage
        ? `${sizedImage(src, 640, 72)} 640w, ${sizedImage(src, 960, 76)} 960w, ${sizedImage(src, 1440, 80)} 1440w, ${sizedImage(src, 1920, 82)} 1920w`
        : undefined}
      sizes={isResponsiveRemoteImage ? sizes : undefined}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
    />
  );
}
