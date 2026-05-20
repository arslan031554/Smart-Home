import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { PresentationContentProvider } from './data/usePresentationContent';

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

export default function PresentationLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = normalizePath(location.pathname);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const link = event.target.closest?.('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      const target = link.getAttribute('target');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.hasAttribute('download')) return;
      if (target && target !== '_self') return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      const current = `${location.pathname}${location.search}${location.hash}`;
      if (nextPath !== current) navigate(nextPath);
    };

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const shell = (
    <div className="presentation-shell min-h-screen bg-fog text-graphite">
      <Navbar currentPath={currentPath} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );

  return <PresentationContentProvider>{shell}</PresentationContentProvider>;
}

