import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../../utils/api';
import { normalizeApiError } from '../../utils/normalizeApiError';
import AnimatedSection from './AnimatedSection';
import ContactCards from './ContactCards';
import SectionTitle from './SectionTitle';
import { usePresentationContent } from '../data/usePresentationContent';
import { getContactPrefill } from '../data/publicPageHelpers';

export default function Contact() {
  const { contact: contactCopy, contactInfo } = usePresentationContent();
  const location = useLocation();
  const [initialPrefill] = useState(() => getContactPrefill(new URLSearchParams(location.search).get('service'), contactCopy.prefillMessages));
  const serviceLabel = initialPrefill?.service
    ? contactCopy.serviceProjectTypes?.[initialPrefill.service] || ''
    : '';
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    projectType: serviceLabel,
    message: initialPrefill?.message || '',
  }));
  const projectTypes = serviceLabel && !contactCopy.projectTypes.includes(serviceLabel)
    ? [serviceLabel, ...contactCopy.projectTypes]
    : contactCopy.projectTypes;
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setStatusMessage('');

    try {
      const response = await api.post('/public/contact', form);
      setStatus('success');
      setStatusMessage(response?.data?.message || 'Mesajul dumneavoastra a fost trimis cu succes.');
      setForm({ name: '', email: '', phone: '', projectType: serviceLabel, message: '' });
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      setStatus('error');
      setStatusMessage(normalizedError.message || 'Eroare la trimiterea mesajului. Va rugam sa incercati din nou.');
    }
  };

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
          <div className="relative overflow-hidden min-h-[520px] rounded-[2rem] shadow-2xl shadow-emerald/15 border border-emerald/10">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.868350567634!2d26.11143821552579!3d44.44521407910196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1f8b4d8f1e687%3A0x8e8334863c5d7966!2sStrada%20Vasile%20Lascar%20178%2C%20Bucure%C8%99ti%20020504%2C%20Romania!5e0!3m2!1sen!2sro!4v1700000000000!5m2!1sen!2sro"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="pointer-events-none absolute bottom-7 left-7 right-7 rounded-2xl border border-white/20 bg-white/95 p-6 text-graphite shadow-2xl backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange">{contactCopy.mapLabel}</p>
              <h3 className="mt-2 text-3xl font-black uppercase">{contactCopy.city}</h3>
              <p className="mt-3 text-sm leading-7 text-graphite/75">{contactInfo.shortAddress}</p>
            </div>
          </div>

          <form className="rounded-[2rem] border border-emerald/10 bg-white p-6 shadow-2xl shadow-emerald/10 sm:p-8" onSubmit={handleSubmit}>
            <h3 className="mb-6 text-xl font-black uppercase text-graphite">{contactCopy.formTitle}</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.name}</span>
                <input className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.name} type="text" value={form.name} onChange={updateField('name')} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.email}</span>
                <input className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.email} type="email" value={form.email} onChange={updateField('email')} required />
              </label>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.phone}</span>
              <input className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.phone} type="tel" value={form.phone} onChange={updateField('phone')} />
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.projectType}</span>
              <select className="w-full rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" value={form.projectType} onChange={updateField('projectType')}>
                <option value="">{contactCopy.placeholders.projectType}</option>
                {projectTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-graphite">{contactCopy.labels.message}</span>
              <textarea className="min-h-36 w-full resize-y rounded-lg border border-slate-200 bg-fog px-4 py-3 text-graphite outline-none transition focus:border-emerald focus:ring-4 focus:ring-emerald/12" placeholder={contactCopy.placeholders.message} value={form.message} onChange={updateField('message')} required />
            </label>
            <button disabled={status === 'submitting'} className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-orange px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-orange transition hover:-translate-y-1 hover:bg-emerald disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:bg-orange" type="submit">
              {status === 'submitting' ? 'Se trimite...' : contactCopy.submit}
              {status === 'submitting' ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
            {statusMessage && (
              <p className={twMerge(clsx('mt-4 text-sm font-medium', status === 'success' ? 'text-emerald' : 'text-red-500'))}>
                {statusMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </AnimatedSection>
  );
}
