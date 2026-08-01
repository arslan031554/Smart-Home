import { motion as Motion } from 'framer-motion';
import { ExternalLink, Play, Youtube } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import RevealCard from './cards/RevealCard';
import SectionTitle from './SectionTitle';
import { usePresentationContent } from '../data/usePresentationContent';
import SiteImage from './SiteImage';

export default function Media() {
  const { media, mediaItems, youtubeVideos } = usePresentationContent();

  return (
    <AnimatedSection id="media" className="bg-white py-24">
      <div className="section-shell container-px">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionTitle
            kicker={media.kicker}
            title={media.title}
            copy={media.copy}
          />
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-5 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-orange transition hover:bg-orange hover:text-white"
          >
            <Youtube size={18} />
            {media.youtubeCta}
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {youtubeVideos.map((video, index) => (
            <RevealCard
              as="article"
              className="group overflow-hidden rounded-[1.5rem] bg-ink shadow-2xl shadow-emerald/15"
              index={index}
              key={video.videoId}
            >
              <div className="relative aspect-video overflow-hidden bg-forest">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="relative overflow-hidden p-6 text-white">
                <div className="absolute inset-0 bg-tech-grid bg-[length:38px_38px] opacity-10" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-orange">
                      <Youtube size={14} />
                      YouTube
                    </span>
                    <a
                      href={video.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-white/60 transition hover:text-orange"
                    >
                      {media.open}
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <h3 className="text-xl font-semibold">{video.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{video.subtitle}</p>
                </div>
              </div>
            </RevealCard>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <RevealCard
                as="article"
                className={`group relative min-h-72 cursor-pointer overflow-hidden rounded-[1.5rem] bg-ink ${
                  index === 0 ? 'lg:col-span-2' : ''
                }`}
                index={index}
                delayStep={0.07}
                key={item.title}
              >
                <SiteImage src={item.image} alt={item.title} className="absolute inset-0 transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
                <div className="relative z-10 flex h-full min-h-[288px] flex-col justify-between p-7">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur">
                      <Icon className="text-orange" size={24} />
                    </div>
                    <Motion.button
                      className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition group-hover:bg-orange group-hover:shadow-orange"
                      whileHover={{ scale: 1.08 }}
                      aria-label={`${media.play} ${item.title}`}
                    >
                      <Play size={22} fill="currentColor" />
                    </Motion.button>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.28em] text-orange">{media.video}</span>
                    <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/60">
                      <Youtube size={13} className="text-orange" />
                      {media.channel}
                    </div>
                  </div>
                </div>
              </RevealCard>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
