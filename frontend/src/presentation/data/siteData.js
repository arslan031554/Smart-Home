import {
  BatteryCharging,
  Blocks,
  Building2,
  CircuitBoard,
  ClipboardList,
  CloudSun,
  Cpu,
  Gauge,
  Home,
  Layers3,
  Lightbulb,
  Mail,
  MapPin,
  MonitorSmartphone,
  PanelsTopLeft,
  Phone,
  RadioTower,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  SunMedium,
  ThermometerSun,
  Waves,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

export const contact = {
  address: 'Strada Vasile Lascar 178, Bucuresti',
  shortAddress: 'Strada Vasile Lascar 178, Bucuresti',
  phone: '+40742568369',
  email: 'office@green-electric.ro',
};

export const navLinks = [
  { label: 'Acasa', href: '/' },
  {
    label: 'Pagini',
    href: '/despre',
    dropdown: 'pages',
  },
  { label: 'Portofoliu', href: '/portofoliu' },
  { label: 'Configurator Smart Home', href: '/smart-home' },
  { label: 'Contact', href: '/contact' },
];

export const companyDescription =
  'Green Electric Innovations este o companie cu capital integral autohton ce are ca obiect de activitate proiectarea si implementarea solutiilor de eficientizare energetica, solutiilor de cladiri inteligente precum si solutiilor personale de productie energie electrica.';

const uploadBase = 'https://green-electric.ro/wp-content/uploads';
const sampleBase = 'https://images.unsplash.com';

export const siteImages = {
  localLogo: '/images/green-electric-logo.png',
  logo: `${uploadBase}/2020/05/Cladiri-Inteligente.png`,
  heroHome: `${sampleBase}/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85`,
  heroControl: `${sampleBase}/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85`,
  heroEnergy: `${sampleBase}/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1800&q=85`,
  about: `${sampleBase}/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1500&q=85`,
  wireeoLogo: `${uploadBase}/2020/05/logo_Wireeo.png`,
  istopLogo: `${uploadBase}/2020/05/logo_I-STOP.png`,
  research: `${sampleBase}/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1500&q=85`,
  euromaster: `${sampleBase}/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1500&q=85`,
  mioveni: `${sampleBase}/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1500&q=85`,
  anasped: `${sampleBase}/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1500&q=85`,
  casaBuhnici: `${sampleBase}/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1500&q=85`,
  dumbrava: `${sampleBase}/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1500&q=85`,
  imobil: `${sampleBase}/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1500&q=85`,
  pergola: `${sampleBase}/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85`,
  apartament: `${sampleBase}/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1500&q=85`,
  // smartPanel: `${sampleBase}/photo-1558002038-1055907df827?auto=format&fit=crop&w=1500&q=85`,
  smartInterior: `${sampleBase}/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1500&q=85`,
};

export const heroSlides = [
  {
    eyebrow: 'Tehnologia la tine acasa',
    title: 'Cladiri moderne',
    text: 'Poti avea acces la orice informatie din cladirea ta, oricat de mare ar fi!',
    button: 'Afla mai multe',
    href: '/despre',
    icon: Home,
    accent: 'Smart living',
    image: siteImages.heroHome,
  },
  {
    eyebrow: 'Conectivitate si control',
    title: 'Mobilitate',
    text: 'Poti controla cladirea ta de oriunde! Depasim granitele tehnologiei!',
    button: 'Vezi solutiile',
    href: '/servicii',
    icon: Smartphone,
    accent: 'Control total',
    image: siteImages.heroControl,
  },
  {
    eyebrow: 'Investeste in viitor!',
    title: 'Eficienta energetica',
    text: 'Solutii de productie si eficienta energetica!',
    button: 'Contacteaza-ne',
    href: '/contact',
    icon: SunMedium,
    accent: 'Energie curata',
    image: siteImages.heroEnergy,
  },
];

export const services = [
  {
    title: 'Proiectare sisteme cladiri inteligente',
    slug: 'proiectare-sisteme-cladiri-inteligente',
    text: 'Un proiect reusit incepe de la faza de identificare a solutiei optime. Scopul departamentului de proiectare este acela de a identifica nevoile viitorului utilizator in relatia cu cladirea in cauza.',
    detail:
      'Pornim de la analiza spatiului, a instalatiilor si a scenariilor de utilizare, apoi construim o arhitectura tehnica coerenta pentru iluminat, climatizare, umbrire, securitate, multimedia si monitorizare energetica.',
    icon: PanelsTopLeft,
    chips: ['KNX/BMS', 'Scenarii inteligente', 'Documentatie tehnica'],
    image: siteImages.heroHome,
  },
  {
    title: 'Consultanta sisteme de cladiri',
    slug: 'consultanta-sisteme-de-cladiri',
    text: 'Pentru realizarea unei solutii corecte de echipare a unei cladiri inteligente este necesara implicarea echipei noastre de la faza de discutii preliminare pana la dezvoltarea sistemelor cladirii.',
    detail:
      'Consultanta noastra ajuta beneficiarii, arhitectii si constructorii sa ia decizii tehnice clare inainte ca solutia sa devina costisitor de modificat in santier.',
    icon: MonitorSmartphone,
    chips: ['Analiza nevoi', 'Bugetare', 'Optimizare tehnica'],
    image: siteImages.heroControl,
  },
  {
    title: 'Implementare si integrare solutii',
    slug: 'implementare-si-integrare-solutii',
    text: 'Implementarea si integrarea solutiilor de cladiri inteligente este atuul nostru. Dezvoltarea a peste 180 de proiecte de diverse marimi si complexitati ne-a oferit un bagaj de experienta definitoriu.',
    detail:
      'Configuram si integram sistemele intr-o experienta simpla pentru utilizator, cu control local, mobil si centralizat pentru cladiri rezidentiale, comerciale sau speciale.',
    icon: CircuitBoard,
    chips: ['Programare KNX', 'Integrare sisteme', 'Control mobil'],
    image: siteImages.anasped,
  }
];

export const pageDropdownItems = [
  { label: 'Despre noi', href: '/despre' },
  { label: 'Servicii', href: '/servicii' },
  ...services.map((service) => ({ label: service.title, href: `/servicii/${service.slug}` })),
  { label: 'Portofoliu', href: '/portofoliu' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

export const serviceHighlights = [
  { title: 'Wireeo', text: 'Suita de aplicatii pentru controlul sistemelor KNX, dedicata utilizatorilor si integratorilor.', icon: RadioTower },
  { title: 'I-STOP', text: 'Serie de produse dedicate pentru detectia inundatiilor si protectia spatiilor moderne.', icon: Waves },
  { title: 'Proiecte in dezvoltare', text: 'Resurse alocate constant pentru gasirea unor solutii tehnice noi si optime.', icon: Layers3 },
];

export const wireeoControls = [
  { label: 'Iluminat', value: '78%', icon: Lightbulb },
  { label: 'Climatizare', value: '22 C', icon: ThermometerSun },
  { label: 'Umbrire', value: 'Auto', icon: SlidersHorizontal },
  { label: 'Ventilatie', value: 'Eco', icon: Wind },
  { label: 'Multimedia', value: 'Sync', icon: RadioTower },
  { label: 'Energie', value: '8 kWp', icon: BatteryCharging },
];

export const stats = [
  { label: 'Proiecte', value: 180, suffix: '+', icon: Building2 },
  { label: 'Echipa', value: 1, suffix: '', icon: ShieldCheck, textValue: 'Dedicata' },
  { label: 'Ani de activitate', value: 11, suffix: '+', icon: Gauge },
];

export const projects = [
  {
    title: 'Sediu Euromaster Romania',
    category: 'Office',
    text: 'Un spatiu de birouri de o inalta eleganta si cu o echipare KNX ce permite controlul simplu al sistemului de climatizare local si centralizat.',
    meta: { Proprietar: 'Euromaster Romania', 'Tip contract': 'Montaj si implementare sistem KNX', Locatie: 'Pipera, Voluntari' },
    image: siteImages.euromaster,
  },
  {
    title: 'Spitalul Orasanesc Mioveni',
    category: 'Medical',
    text: 'Cel mai nou spital din Romania este dotat cu tehnologie moderna pentru controlul sistemelor cladirii, monitorizare si gestiune energetica.',
    meta: { Proprietar: 'Spitalul Orasanesc Mioveni', 'Tip contract': 'Integrare sisteme tehnice pentru cladire', Locatie: 'Mioveni' },
    image: siteImages.mioveni,
  },
  {
    title: 'Sediul Anasped Suceava',
    category: 'Office',
    text: 'O investitie responsabila realizata cu scopul de a obtine confort, eficienta si control centralizat pentru spatiile de birouri.',
    meta: { Proprietar: 'Anasped', 'Tip contract': 'Automatizare si implementare sistem KNX', Locatie: 'Suceava' },
    image: siteImages.anasped,
  },
  {
    title: '#CasaBuhnici',
    category: 'Rezidential',
    text: 'O provocare tehnica unica, cu elemente multiple de automatizare integrate intr-un sistem ridicat la standarde inalte.',
    meta: { Proprietar: 'George Buhnici', 'Tip contract': 'Consultanta si implementare sistem KNX', Locatie: 'Corbeanca' },
    image: siteImages.casaBuhnici,
  },
  {
    title: 'Dumbrava Vlasiei',
    category: 'Rezidential',
    text: 'Un complex unic si modern echipat cu sisteme de automatizare KNX pentru controlul climatizarii si confortului.',
    meta: { Proprietar: 'Complexul Dumbrava Vlasiei', 'Tip contract': 'Implementare sistem KNX', Locatie: 'Ilfov' },
    image: siteImages.dumbrava,
  },
  {
    title: 'Imobil de locuit',
    category: 'Rezidential',
    text: 'O casa echipata cu tehnologii moderne pentru control, confort si eficienta energetica, inclusiv sistem fotovoltaic si scenarii KNX.',
    meta: { Proprietar: 'Persoana fizica', 'Tip contract': 'Consultanta, cablaje, montaj si implementare KNX', Locatie: 'Bucuresti' },
    image: siteImages.imobil,
  },
  {
    title: 'Pergola Hotel Boutique',
    category: 'Hospitality',
    text: 'Un hotel echipat complet cu tehnologie KNX pentru confort, control intuitiv si experienta rafinata pentru clienti.',
    meta: { Proprietar: 'Pergola Hotel Boutique', 'Tip contract': 'Implementare sistem KNX si control integrat', Locatie: 'Bucuresti' },
    image: siteImages.pergola,
  },
  {
    title: 'Apartament Bucuresti',
    category: 'Rezidential',
    text: 'Un apartament cu control avansat al iluminatului, climatizarii si scenariilor de confort pentru utilizare zilnica simpla.',
    meta: { Proprietar: 'Persoana fizica', 'Tip contract': 'Automatizare iluminat si climatizare', Locatie: 'Bucuresti' },
    image: siteImages.apartament,
  },
];

export const mediaItems = [
  { title: 'Iluminat inteligent', icon: Lightbulb, image: siteImages.heroHome },
  { title: '#CasaBuhnici', icon: Home, image: siteImages.casaBuhnici },
  { title: 'Investeste in viitor!', icon: SunMedium, image: siteImages.heroEnergy },
  { title: 'Se poate si la birou!', icon: Building2, image: siteImages.euromaster },
  { title: 'Ce se mai intampla pe la proiectele noastre?', icon: Waves, image: siteImages.anasped },
];

export const youtubeVideos = [
  {
    title: 'Green Electric Innovations - Cladiri inteligente',
    subtitle: 'Automatizare, control si confort pentru cladiri moderne',
    videoId: 'X_GduzTu_EU',
    href: 'https://youtu.be/X_GduzTu_EU',
  },
  {
    title: 'Green Electric Innovations - Solutii smart home',
    subtitle: 'Tehnologie integrata pentru locuinte si spatii eficiente',
    videoId: '131dfskhxfU',
    href: 'https://youtu.be/131dfskhxfU',
  },
];

export const footerServices = services.map((service) => service.title);

export const aboutFeatures = [
  { title: 'Misiune', text: 'Solutii clare pentru cladiri eficiente, conectate si usor de controlat.', icon: CircuitBoard },
  { title: 'Viziune', text: 'Cladiri moderne in care tehnologia lucreaza natural pentru oameni.', icon: Zap },
  { title: 'Valori', text: 'Responsabilitate tehnica, inovatie aplicata si respect pentru energie.', icon: ShieldCheck },
];

export const processSteps = [
  {
    number: '01',
    title: 'Consultanta si analiza',
    text: 'Analizam nevoile cladirii si identificam solutiile potrivite pentru confort, control si eficienta.',
    icon: ClipboardList,
  },
  {
    number: '02',
    title: 'Proiectare sistem',
    text: 'Elaboram proiectul tehnic, selectam echipamentele si pregatim arhitectura de automatizare.',
    icon: Settings2,
  },
  {
    number: '03',
    title: 'Implementare',
    text: 'Montam, configuram si programam sistemele cladirii inteligente conform standardelor proiectului.',
    icon: CircuitBoard,
  },
  {
    number: '04',
    title: 'Suport si optimizare',
    text: 'Asiguram suport, reglaje si mentenanta pentru functionarea corecta pe termen lung.',
    icon: Wrench,
  },
];

export const contactCards = [
  { label: 'Adresa', value: contact.address, icon: MapPin },
  { label: 'Telefon', value: contact.phone, icon: Phone, href: `tel:${contact.phone}` },
  { label: 'Email', value: contact.email, icon: Mail, href: `mailto:${contact.email}` },
];
