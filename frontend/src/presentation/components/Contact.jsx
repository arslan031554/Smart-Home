import { Send } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import ContactCards from './ContactCards';
import SectionTitle from './SectionTitle';
import { usePresentationContent } from '../data/usePresentationContent';

export default function Contact() {
  const { contact: contactCopy, contactInfo } = usePresentationContent();

  return (
    <AnimatedSection id="contact" className="bg-fog py-24">
      <div className="section-shell container-px">
        <SectionTitle
          kicker={contactCopy.kicker}
          title={contactCopy.title}
          copy={contactCopy.copy}
          align="center"
        />

        <div className="mt-14">
          <ContactCards />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="smart-building min-h-[520px] rounded-lg shadow-2xl shadow-emerald/15">
            <div className="absolute inset-0 bg-[rgba(3,18,13,0.34)]" />
            <div className="absolute bottom-7 left-7 right-7 rounded-lg border border-white/20 bg-white/15 p-6 text-white backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange">{contactCopy.mapLabel}</p>
              <h3 className="mt-2 text-3xl font-black uppercase">{contactCopy.city}</h3>
              <p className="mt-3 text-sm leading-7 text-white/75">{contactInfo.shortAddress}</p>
            </div>
          </div>

          <form className="rounded-lg bg-white p-6 shadow-2xl shadow-emerald/10 sm:p-8" onSubmit={(e) => e.preventDefault()}>
            <h3 className="mb-6 text-xl font-black uppercase text-graphite">{contactCopy.formTitle}</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.name}</span>
                <input className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.name} type="text" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.email}</span>
                <input className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.email} type="email" required />
              </label>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.phone}</span>
              <input className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.phone} type="tel" />
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.projectType}</span>
              <select className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12">
                <option value="">{contactCopy.placeholders.projectType}</option>
                {contactCopy.projectTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.message}</span>
              <textarea className="min-h-36 w-full resize-y rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.message} required />
            </label>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-orange px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-emerald" type="submit">
              {contactCopy.submit}
              <Send size={17} />
            </button>
          </form>
        </div>
      </div>
    </AnimatedSection>
  );
}
