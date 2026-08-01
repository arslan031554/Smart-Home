import { useLayoutEffect } from 'react';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export default function SeoHead({ title, description, image = '/images/green-electric-logo.png' }) {
  useLayoutEffect(() => {
    if (title) document.title = title;
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description });
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
      upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    }
    if (title) {
      upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
      upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    }
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: new URL(image, window.location.origin).href });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`;
  }, [description, image, title]);

  return null;
}
