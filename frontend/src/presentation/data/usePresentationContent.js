import { createContext, createElement, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  aboutFeatures as baseAboutFeatures,
  contact,
  contactCards as baseContactCards,
  heroSlides as baseHeroSlides,
  mediaItems as baseMediaItems,
  pageDropdownItems as basePageDropdownItems,
  processSteps as baseProcessSteps,
  projects as baseProjects,
  serviceHighlights as baseServiceHighlights,
  services as baseServices,
  siteImages,
  stats as baseStats,
  wireeoControls as baseWireeoControls,
  youtubeVideos as baseYoutubeVideos,
} from './siteData';

const presentationCopy = {
  ro: {
    companyDescription:
      'Green Electric Innovations este o companie cu capital integral autohton ce are ca obiect de activitate proiectarea si implementarea solutiilor de eficientizare energetica, solutiilor de cladiri inteligente precum si solutiilor personale de productie energie electrica.',
    nav: {
      home: 'Acasa',
      pages: 'Pagini',
      portfolio: 'Portofoliu',
      configurator: 'Configurator Smart Home',
      contact: 'Contact',
      support: 'Suport Clienti',
    },
    pages: {
      about: { title: 'Despre noi', eyebrow: 'Green Electric Innovations', breadcrumb: ['Acasa', 'Despre noi'] },
      services: { title: 'Servicii', eyebrow: 'Solutii complete', breadcrumb: ['Acasa', 'Servicii'] },
      portfolio: { title: 'Portofoliu', eyebrow: 'Proiecte smart home', breadcrumb: ['Acasa', 'Portofoliu'] },
      media: { title: 'Media', eyebrow: 'Video si proiecte', breadcrumb: ['Acasa', 'Media'] },
      contact: { title: 'Contact', eyebrow: 'Hai sa discutam', breadcrumb: ['Acasa', 'Contact'] },
    },
    heroSlides: [
      {
        eyebrow: 'Tehnologia la tine acasa',
        title: 'Cladiri moderne',
        text: 'Poti avea acces la orice informatie din cladirea ta, oricat de mare ar fi!',
        button: 'Afla mai multe',
        accent: 'Smart living',
      },
      {
        eyebrow: 'Conectivitate si control',
        title: 'Mobilitate',
        text: 'Poti controla cladirea ta de oriunde! Depasim granitele tehnologiei!',
        button: 'Vezi solutiile',
        accent: 'Control total',
      },
      {
        eyebrow: 'Investeste in viitor!',
        title: 'Eficienta energetica',
        text: 'Solutii de productie si eficienta energetica!',
        button: 'Contacteaza-ne',
        accent: 'Energie curata',
      },
    ],
    hero: {
      portfolio: 'Portofoliu',
      liveLabel: 'Smart Building Live',
      centralizedControl: 'Control centralizat',
      monitorLabel: 'Green Electric',
      monitorTitle: 'Energy Monitor',
      previousSlide: 'Slide anterior',
      nextSlide: 'Slide urmator',
      dashboardItems: [
        { label: 'Iluminat', value: '78%' },
        { label: 'Climat', value: '22 C' },
        { label: 'Acces', value: 'Activ' },
        { label: 'Energie', value: '8 kWp' },
      ],
      stats: ['KNX / BMS', 'Control mobil', 'Eficienta energetica'],
    },
    servicesSection: {
      kicker: 'Servicii',
      title: 'Solutii complete pentru cladiri inteligente',
      copy: 'Serviciile Green Electric Innovations acopera drumul complet: proiectare, consultanta, implementare, productie de energie, tablouri electrice de automatizari si inovatie aplicata.',
      cta: 'Cere o oferta',
      learnMore: 'Afla mai multe',
      features: [
        'Sisteme KNX / BMS',
        'Control iluminat',
        'HVAC',
        'Umbrire automatizata',
        'Sisteme fotovoltaice',
        'Monitoring energetic',
      ],
    },
    services: [
      {
        title: 'Proiectare sisteme cladiri inteligente',
        text: 'Un proiect reusit incepe de la faza de identificare a solutiei optime. Scopul departamentului de proiectare este acela de a identifica nevoile viitorului utilizator in relatia cu cladirea in cauza.',
        detail:
          'Pornim de la analiza spatiului, a instalatiilor si a scenariilor de utilizare, apoi construim o arhitectura tehnica coerenta pentru iluminat, climatizare, umbrire, securitate, multimedia si monitorizare energetica.',
        chips: ['KNX/BMS', 'Scenarii inteligente', 'Documentatie tehnica'],
      },
      {
        title: 'Consultanta sisteme de cladiri',
        text: 'Pentru realizarea unei solutii corecte de echipare a unei cladiri inteligente este necesara implicarea echipei noastre de la faza de discutii preliminare pana la dezvoltarea sistemelor cladirii.',
        detail:
          'Consultanta noastra ajuta beneficiarii, arhitectii si constructorii sa ia decizii tehnice clare inainte ca solutia sa devina costisitor de modificat in santier.',
        chips: ['Analiza nevoi', 'Bugetare', 'Optimizare tehnica'],
      },
      {
        title: 'Implementare si integrare solutii',
        text: 'Implementarea si integrarea solutiilor de cladiri inteligente este atuul nostru. Dezvoltarea a peste 180 de proiecte de diverse marimi si complexitati ne-a oferit un bagaj de experienta definitoriu.',
        detail:
          'Configuram si integram sistemele intr-o experienta simpla pentru utilizator, cu control local, mobil si centralizat pentru cladiri rezidentiale, comerciale sau speciale.',
        chips: ['Programare KNX', 'Integrare sisteme', 'Control mobil'],
      }
    ],
    about: {
      kicker: 'Despre Green Electric Innovations',
      title: 'Cladiri inteligente, eficienta si control',
      extra:
        'Construim solutii de automatizare pentru locuinte, spatii comerciale si cladiri moderne, de la consultanta si proiectare pana la implementare, tablouri electrice si productie de energie regenerabila.',
      pills: ['Cladiri moderne', 'Control mobil', 'Eficienta energetica'],
      servicesButton: 'Servicii',
      contactButton: 'Contact',
      smartHome: 'Smart home',
      controlTotal: 'Control total',
      energy: 'Energie',
      imageAlt: 'Green Electric cladiri inteligente',
    },
    aboutFeatures: [
      { title: 'Misiune', text: 'Solutii clare pentru cladiri eficiente, conectate si usor de controlat.' },
      { title: 'Viziune', text: 'Cladiri moderne in care tehnologia lucreaza natural pentru oameni.' },
      { title: 'Valori', text: 'Responsabilitate tehnica, inovatie aplicata si respect pentru energie.' },
    ],
    innovation: {
      kicker: 'Alte solutii',
      title: 'Wireeo si inovatie aplicata',
      copy: 'Wireeo este o suita de aplicatii destinate controlului sistemelor KNX, dedicata atat utilizatorilor cat si integratorilor, dezvoltata de echipa noastra.',
      cta: 'Cercetare si inovare',
      mobileLabel: 'Wireeo mobile',
      mobileTitle: 'Acasa',
      buildingOs: 'Building OS',
      realtimeControl: 'Control in timp real',
      online: 'Online',
    },
    serviceHighlights: [
      { title: 'Wireeo', text: 'Suita de aplicatii pentru controlul sistemelor KNX, dedicata utilizatorilor si integratorilor.' },
      { title: 'I-STOP', text: 'Serie de produse dedicate pentru detectia inundatiilor si protectia spatiilor moderne.' },
      { title: 'Proiecte in dezvoltare', text: 'Resurse alocate constant pentru gasirea unor solutii tehnice noi si optime.' },
    ],
    wireeoControls: [
      { label: 'Iluminat', value: '78%' },
      { label: 'Climatizare', value: '22 C' },
      { label: 'Umbrire', value: 'Auto' },
      { label: 'Ventilatie', value: 'Eco' },
      { label: 'Multimedia', value: 'Sync' },
      { label: 'Energie', value: '8 kWp' },
    ],
    statsSection: {
      kicker: 'Realizari',
      title: 'Cateva cifre care ne definesc',
    },
    stats: [
      { label: 'Proiecte', textValue: undefined },
      { label: 'Echipa', textValue: 'Dedicata' },
      { label: 'Ani de activitate', textValue: undefined },
    ],
    portfolio: {
      kicker: 'Portofoliu',
      title: 'Proiecte reprezentative',
      copy: 'Cateva dintre proiectele Green Electric Innovations in care tehnologia, confortul si eficienta energetica lucreaza impreuna.',
      categories: [
        { key: 'all', label: 'Toate' },
        { key: 'office', label: 'Office' },
        { key: 'medical', label: 'Medical' },
        { key: 'residential', label: 'Rezidential' },
        { key: 'hospitality', label: 'Hospitality' },
      ],
      locationLabel: 'Locatie',
    },
    projects: [
      {
        title: 'Sediu Euromaster Romania',
        category: 'Office',
        categoryKey: 'office',
        text: 'Un spatiu de birouri de o inalta eleganta si cu o echipare KNX ce permite controlul simplu al sistemului de climatizare local si centralizat.',
        meta: { Proprietar: 'Euromaster Romania', 'Tip contract': 'Montaj si implementare sistem KNX', Locatie: 'Pipera, Voluntari' },
      },
      {
        title: 'Spitalul Orasanesc Mioveni',
        category: 'Medical',
        categoryKey: 'medical',
        text: 'Cel mai nou spital din Romania este dotat cu tehnologie moderna pentru controlul sistemelor cladirii, monitorizare si gestiune energetica.',
        meta: { Proprietar: 'Spitalul Orasanesc Mioveni', 'Tip contract': 'Integrare sisteme tehnice pentru cladire', Locatie: 'Mioveni' },
      },
      {
        title: 'Sediul Anasped Suceava',
        category: 'Office',
        categoryKey: 'office',
        text: 'O investitie responsabila realizata cu scopul de a obtine confort, eficienta si control centralizat pentru spatiile de birouri.',
        meta: { Proprietar: 'Anasped', 'Tip contract': 'Automatizare si implementare sistem KNX', Locatie: 'Suceava' },
      },
      {
        title: '#CasaBuhnici',
        category: 'Rezidential',
        categoryKey: 'residential',
        text: 'O provocare tehnica unica, cu elemente multiple de automatizare integrate intr-un sistem ridicat la standarde inalte.',
        meta: { Proprietar: 'George Buhnici', 'Tip contract': 'Consultanta si implementare sistem KNX', Locatie: 'Corbeanca' },
      },
      {
        title: 'Dumbrava Vlasiei',
        category: 'Rezidential',
        categoryKey: 'residential',
        text: 'Un complex unic si modern echipat cu sisteme de automatizare KNX pentru controlul climatizarii si confortului.',
        meta: { Proprietar: 'Complexul Dumbrava Vlasiei', 'Tip contract': 'Implementare sistem KNX', Locatie: 'Ilfov' },
      },
      {
        title: 'Imobil de locuit',
        category: 'Rezidential',
        categoryKey: 'residential',
        text: 'O casa echipata cu tehnologii moderne pentru control, confort si eficienta energetica, inclusiv sistem fotovoltaic si scenarii KNX.',
        meta: { Proprietar: 'Persoana fizica', 'Tip contract': 'Consultanta, cablaje, montaj si implementare KNX', Locatie: 'Bucuresti' },
      },
      {
        title: 'Pergola Hotel Boutique',
        category: 'Hospitality',
        categoryKey: 'hospitality',
        text: 'Un hotel echipat complet cu tehnologie KNX pentru confort, control intuitiv si experienta rafinata pentru clienti.',
        meta: { Proprietar: 'Pergola Hotel Boutique', 'Tip contract': 'Implementare sistem KNX si control integrat', Locatie: 'Bucuresti' },
      },
      {
        title: 'Apartament Bucuresti',
        category: 'Rezidential',
        categoryKey: 'residential',
        text: 'Un apartament cu control avansat al iluminatului, climatizarii si scenariilor de confort pentru utilizare zilnica simpla.',
        meta: { Proprietar: 'Persoana fizica', 'Tip contract': 'Automatizare iluminat si climatizare', Locatie: 'Bucuresti' },
      },
    ],
    process: {
      kicker: 'Proces',
      title: 'Cum functioneaza',
      copy: 'De la prima discutie pana la sistemul final, lucram structurat: analiza, proiectare, implementare si optimizare.',
    },
    processSteps: [
      { title: 'Consultanta si analiza', text: 'Analizam nevoile cladirii si identificam solutiile potrivite pentru confort, control si eficienta.' },
      { title: 'Proiectare sistem', text: 'Elaboram proiectul tehnic, selectam echipamentele si pregatim arhitectura de automatizare.' },
      { title: 'Implementare', text: 'Montam, configuram si programam sistemele cladirii inteligente conform standardelor proiectului.' },
      { title: 'Suport si optimizare', text: 'Asiguram suport, reglaje si mentenanta pentru functionarea corecta pe termen lung.' },
    ],
    media: {
      kicker: 'Media',
      title: 'O suita de lucruri interesante',
      copy: 'Viata este colorata, dar si casa ta poate fi. Urmareste materiale despre proiecte, solutii si inovatiile Green Electric Innovations.',
      youtubeCta: 'Vezi YouTube',
      open: 'Deschide',
      video: 'Video',
      play: 'Reda',
      channel: 'Green Electric Innovations',
    },
    mediaItems: [
      { title: 'Iluminat inteligent' },
      { title: '#CasaBuhnici' },
      { title: 'Investeste in viitor!' },
      { title: 'Se poate si la birou!' },
      { title: 'Ce se mai intampla pe la proiectele noastre?' },
    ],
    youtubeVideos: [
      { title: 'Green Electric Innovations - Cladiri inteligente', subtitle: 'Automatizare, control si confort pentru cladiri moderne' },
      { title: 'Green Electric Innovations - Solutii smart home', subtitle: 'Tehnologie integrata pentru locuinte si spatii eficiente' },
    ],
    contact: {
      kicker: 'Contact',
      title: 'Hai sa discutam despre proiectul tau',
      copy: 'Trimite cateva detalii, iar echipa Green Electric Innovations iti va raspunde cu solutia potrivita pentru cladirea ta.',
      mapLabel: 'Map placeholder',
      city: 'Bucuresti',
      formTitle: 'Trimite un mesaj',
      labels: {
        name: 'Nume *',
        email: 'Email *',
        phone: 'Telefon',
        projectType: 'Tip proiect',
        message: 'Mesaj *',
      },
      placeholders: {
        name: 'Numele tau',
        email: 'email@exemplu.ro',
        phone: '+40 7XX XXX XXX',
        projectType: 'Selecteaza tipul proiectului...',
        message: 'Spune-ne cateva detalii despre proiectul tau...',
      },
      projectTypes: ['Rezidential - casa/apartament', 'Comercial - birouri', 'Hospitality - hotel/restaurant', 'Industrial / Medical', 'Consultanta'],
      submit: 'Trimite mesajul',
    },
    contactCards: [
      { label: 'Adresa' },
      { label: 'Telefon' },
      { label: 'Email' },
    ],
    serviceDetails: {
      eyebrow: 'Servicii Green Electric',
      researchTitle: 'Cercetare si inovare',
      brandLabel: 'Green Electric Innovations',
      dedicatedPage: 'Pagina dedicata',
      specializedService: 'Serviciu specializat',
      related: 'Servicii conexe',
      ctaKicker: 'Final CTA',
      ctaTitle: 'Pregatit pentru o cladire mai inteligenta?',
      ctaCopy: 'Discutam obiectivul, stabilim solutia corecta si construim o experienta de control moderna.',
    },
    cta: {
      kicker: 'Investeste in viitor',
      title: 'Solutii de productie si eficienta energetica',
      copy: 'Control, confort si economie intr-o solutie integrata pentru case, birouri si cladiri moderne.',
      button: 'Solicita o oferta',
    },
    footer: {
      menu: 'Menu',
      services: 'Servicii',
      contact: 'Contact',
      configurator: 'Configurator Smart Home',
      offer: 'Cere oferta',
      copyright: 'Toate drepturile rezervate.',
      tagline: 'Cladiri inteligente si eficienta energetica',
    },
  },
  en: {
    companyDescription:
      'Green Electric Innovations is a Romanian-owned company focused on designing and implementing energy efficiency systems, intelligent building solutions, and personal electrical energy production systems.',
    nav: {
      home: 'Home',
      pages: 'Pages',
      portfolio: 'Portfolio',
      configurator: 'Smart Home Configurator',
      contact: 'Contact',
      support: 'Customer Support',
    },
    pages: {
      about: { title: 'About us', eyebrow: 'Green Electric Innovations', breadcrumb: ['Home', 'About us'] },
      services: { title: 'Services', eyebrow: 'Complete solutions', breadcrumb: ['Home', 'Services'] },
      portfolio: { title: 'Portfolio', eyebrow: 'Smart home projects', breadcrumb: ['Home', 'Portfolio'] },
      media: { title: 'Media', eyebrow: 'Video and projects', breadcrumb: ['Home', 'Media'] },
      contact: { title: 'Contact', eyebrow: 'Let us talk', breadcrumb: ['Home', 'Contact'] },
    },
    heroSlides: [
      {
        eyebrow: 'Technology at home',
        title: 'Modern buildings',
        text: 'Access every important detail about your building, no matter how large it is.',
        button: 'Learn more',
        accent: 'Smart living',
      },
      {
        eyebrow: 'Connectivity and control',
        title: 'Mobility',
        text: 'Control your building from anywhere. We push technology beyond its usual limits.',
        button: 'View solutions',
        accent: 'Total control',
      },
      {
        eyebrow: 'Invest in the future!',
        title: 'Energy efficiency',
        text: 'Production and energy-efficiency solutions for modern homes and buildings.',
        button: 'Contact us',
        accent: 'Clean energy',
      },
    ],
    hero: {
      portfolio: 'Portfolio',
      liveLabel: 'Smart Building Live',
      centralizedControl: 'Centralized control',
      monitorLabel: 'Green Electric',
      monitorTitle: 'Energy Monitor',
      previousSlide: 'Previous slide',
      nextSlide: 'Next slide',
      dashboardItems: [
        { label: 'Lighting', value: '78%' },
        { label: 'Climate', value: '22 C' },
        { label: 'Access', value: 'Active' },
        { label: 'Energy', value: '8 kWp' },
      ],
      stats: ['KNX / BMS', 'Mobile control', 'Energy efficiency'],
    },
    servicesSection: {
      kicker: 'Services',
      title: 'Complete solutions for intelligent buildings',
      copy: 'Green Electric Innovations services cover the full path: design, consulting, implementation, energy production, automation electrical panels, and applied innovation.',
      cta: 'Request an offer',
      learnMore: 'Learn more',
      features: [
        'KNX / BMS systems',
        'Lighting control',
        'HVAC',
        'Automated shading',
        'Photovoltaic systems',
        'Energy monitoring',
      ],
    },
    services: [
      {
        title: 'Intelligent building system design',
        text: 'A successful project starts by identifying the right solution. Our design department maps the future user needs in relation to the building.',
        detail:
          'We begin with the space, installations, and usage scenarios, then build a coherent technical architecture for lighting, climate, shading, security, multimedia, and energy monitoring.',
        chips: ['KNX/BMS', 'Smart scenarios', 'Technical documentation'],
      },
      {
        title: 'Building systems consulting',
        text: 'A correct intelligent building solution needs our team involved from the earliest discussions through the development of the building systems.',
        detail:
          'Our consulting helps owners, architects, and builders make clear technical decisions before the solution becomes expensive to change on site.',
        chips: ['Needs analysis', 'Budgeting', 'Technical optimization'],
      },
      {
        title: 'Solution implementation and integration',
        text: 'Implementation and integration of intelligent building systems is our core strength. More than 180 projects of varied size and complexity shaped our experience.',
        detail:
          'We configure and integrate systems into a simple user experience, with local, mobile, and centralized control for residential, commercial, or specialized buildings.',
        chips: ['KNX programming', 'System integration', 'Mobile control'],
      }
    ],
    about: {
      kicker: 'About Green Electric Innovations',
      title: 'Intelligent buildings, efficiency, and control',
      extra:
        'We build automation solutions for homes, commercial spaces, and modern buildings, from consulting and design to implementation, electrical panels, and renewable energy production.',
      pills: ['Modern buildings', 'Mobile control', 'Energy efficiency'],
      servicesButton: 'Services',
      contactButton: 'Contact',
      smartHome: 'Smart home',
      controlTotal: 'Total control',
      energy: 'Energy',
      imageAlt: 'Green Electric intelligent buildings',
    },
    aboutFeatures: [
      { title: 'Mission', text: 'Clear solutions for efficient, connected buildings that are easy to control.' },
      { title: 'Vision', text: 'Modern buildings where technology works naturally for people.' },
      { title: 'Values', text: 'Technical responsibility, applied innovation, and respect for energy.' },
    ],
    innovation: {
      kicker: 'Other solutions',
      title: 'Wireeo and applied innovation',
      copy: 'Wireeo is an application suite for KNX system control, dedicated to both users and integrators and developed by our team.',
      cta: 'Research and innovation',
      mobileLabel: 'Wireeo mobile',
      mobileTitle: 'Home',
      buildingOs: 'Building OS',
      realtimeControl: 'Real-time control',
      online: 'Online',
    },
    serviceHighlights: [
      { title: 'Wireeo', text: 'Application suite for KNX system control, built for both users and integrators.' },
      { title: 'I-STOP', text: 'Dedicated flood detection products for protecting modern spaces.' },
      { title: 'Projects in development', text: 'Resources allocated constantly to finding new and optimal technical solutions.' },
    ],
    wireeoControls: [
      { label: 'Lighting', value: '78%' },
      { label: 'Climate', value: '22 C' },
      { label: 'Shading', value: 'Auto' },
      { label: 'Ventilation', value: 'Eco' },
      { label: 'Multimedia', value: 'Sync' },
      { label: 'Energy', value: '8 kWp' },
    ],
    statsSection: {
      kicker: 'Achievements',
      title: 'A few numbers that define us',
    },
    stats: [
      { label: 'Projects', textValue: undefined },
      { label: 'Team', textValue: 'Dedicated' },
      { label: 'Years of activity', textValue: undefined },
    ],
    portfolio: {
      kicker: 'Portfolio',
      title: 'Representative projects',
      copy: 'A selection of Green Electric Innovations projects where technology, comfort, and energy efficiency work together.',
      categories: [
        { key: 'all', label: 'All' },
        { key: 'office', label: 'Office' },
        { key: 'medical', label: 'Medical' },
        { key: 'residential', label: 'Residential' },
        { key: 'hospitality', label: 'Hospitality' },
      ],
      locationLabel: 'Location',
    },
    projects: [
      {
        title: 'Euromaster Romania Headquarters',
        category: 'Office',
        categoryKey: 'office',
        text: 'An elegant office space with KNX equipment that enables simple local and centralized control of the climate system.',
        meta: { Owner: 'Euromaster Romania', 'Contract type': 'KNX system installation and implementation', Location: 'Pipera, Voluntari' },
      },
      {
        title: 'Mioveni City Hospital',
        category: 'Medical',
        categoryKey: 'medical',
        text: 'One of Romania newest hospitals uses modern technology for building system control, monitoring, and energy management.',
        meta: { Owner: 'Mioveni City Hospital', 'Contract type': 'Technical building system integration', Location: 'Mioveni' },
      },
      {
        title: 'Anasped Suceava Headquarters',
        category: 'Office',
        categoryKey: 'office',
        text: 'A responsible investment designed to deliver comfort, efficiency, and centralized control for office spaces.',
        meta: { Owner: 'Anasped', 'Contract type': 'KNX automation and implementation', Location: 'Suceava' },
      },
      {
        title: '#CasaBuhnici',
        category: 'Residential',
        categoryKey: 'residential',
        text: 'A unique technical challenge with multiple automation elements integrated into a high-standard system.',
        meta: { Owner: 'George Buhnici', 'Contract type': 'KNX consulting and implementation', Location: 'Corbeanca' },
      },
      {
        title: 'Dumbrava Vlasiei',
        category: 'Residential',
        categoryKey: 'residential',
        text: 'A unique modern complex equipped with KNX automation systems for climate and comfort control.',
        meta: { Owner: 'Dumbrava Vlasiei Complex', 'Contract type': 'KNX system implementation', Location: 'Ilfov' },
      },
      {
        title: 'Residential Building',
        category: 'Residential',
        categoryKey: 'residential',
        text: 'A home equipped with modern technologies for control, comfort, and energy efficiency, including photovoltaic systems and KNX scenarios.',
        meta: { Owner: 'Private client', 'Contract type': 'Consulting, cabling, installation, and KNX implementation', Location: 'Bucharest' },
      },
      {
        title: 'Pergola Boutique Hotel',
        category: 'Hospitality',
        categoryKey: 'hospitality',
        text: 'A hotel fully equipped with KNX technology for comfort, intuitive control, and a refined guest experience.',
        meta: { Owner: 'Pergola Boutique Hotel', 'Contract type': 'KNX system implementation and integrated control', Location: 'Bucharest' },
      },
      {
        title: 'Bucharest Apartment',
        category: 'Residential',
        categoryKey: 'residential',
        text: 'An apartment with advanced lighting, climate, and comfort scenario control for simple daily use.',
        meta: { Owner: 'Private client', 'Contract type': 'Lighting and climate automation', Location: 'Bucharest' },
      },
    ],
    process: {
      kicker: 'Process',
      title: 'How it works',
      copy: 'From the first conversation to the final system, we work in a structured way: analysis, design, implementation, and optimization.',
    },
    processSteps: [
      { title: 'Consulting and analysis', text: 'We analyze the building needs and identify the right solutions for comfort, control, and efficiency.' },
      { title: 'System design', text: 'We prepare the technical design, select equipment, and define the automation architecture.' },
      { title: 'Implementation', text: 'We install, configure, and program intelligent building systems according to project standards.' },
      { title: 'Support and optimization', text: 'We provide support, tuning, and maintenance for correct long-term operation.' },
    ],
    media: {
      kicker: 'Media',
      title: 'A suite of interesting things',
      copy: 'Life is colorful, and your home can be too. Watch materials about Green Electric Innovations projects, solutions, and innovations.',
      youtubeCta: 'View YouTube',
      open: 'Open',
      video: 'Video',
      play: 'Play',
      channel: 'Green Electric Innovations',
    },
    mediaItems: [
      { title: 'Smart lighting' },
      { title: '#CasaBuhnici' },
      { title: 'Invest in the future!' },
      { title: 'It works at the office too!' },
      { title: 'What is happening in our projects?' },
    ],
    youtubeVideos: [
      { title: 'Green Electric Innovations - Intelligent buildings', subtitle: 'Automation, control, and comfort for modern buildings' },
      { title: 'Green Electric Innovations - Smart home solutions', subtitle: 'Integrated technology for efficient homes and spaces' },
    ],
    contact: {
      kicker: 'Contact',
      title: 'Let us discuss your project',
      copy: 'Send a few details and the Green Electric Innovations team will respond with the right solution for your building.',
      mapLabel: 'Map placeholder',
      city: 'Bucharest',
      formTitle: 'Send a message',
      labels: {
        name: 'Name *',
        email: 'Email *',
        phone: 'Phone',
        projectType: 'Project type',
        message: 'Message *',
      },
      placeholders: {
        name: 'Your name',
        email: 'email@example.com',
        phone: '+40 7XX XXX XXX',
        projectType: 'Select the project type...',
        message: 'Tell us a few details about your project...',
      },
      projectTypes: ['Residential - house/apartment', 'Commercial - offices', 'Hospitality - hotel/restaurant', 'Industrial / Medical', 'Consulting'],
      submit: 'Send message',
    },
    contactCards: [
      { label: 'Address' },
      { label: 'Phone' },
      { label: 'Email' },
    ],
    serviceDetails: {
      eyebrow: 'Green Electric Services',
      researchTitle: 'Research and innovation',
      brandLabel: 'Green Electric Innovations',
      dedicatedPage: 'Dedicated page',
      specializedService: 'Specialized service',
      related: 'Related services',
      ctaKicker: 'Final CTA',
      ctaTitle: 'Ready for a smarter building?',
      ctaCopy: 'We discuss the objective, define the right solution, and build a modern control experience.',
    },
    cta: {
      kicker: 'Invest in the future',
      title: 'Efficient solutions',
      copy: 'Control, comfort, and savings in one integrated solution for homes, offices, and modern buildings.',
      button: 'Request an offer',
    },
    footer: {
      menu: 'Menu',
      services: 'Services',
      contact: 'Contact',
      configurator: 'Smart Home Configurator',
      offer: 'Request offer',
      copyright: 'All rights reserved.',
      tagline: 'Intelligent buildings and energy efficiency',
    },
  },
};

function mergeByIndex(baseItems, copyItems = []) {
  return baseItems.map((item, index) => ({
    ...item,
    ...(copyItems[index] || {}),
  }));
}

function getLanguage(i18n) {
  return (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en';
}

const PresentationContentContext = createContext(null);

function usePresentationContentValue() {
  const { i18n } = useTranslation();
  const language = getLanguage(i18n);

  return useMemo(() => {
    const copy = presentationCopy[language] || presentationCopy.en;
    const services = mergeByIndex(baseServices, copy.services);
    const serviceHighlights = mergeByIndex(baseServiceHighlights, copy.serviceHighlights);
    const wireeoControls = mergeByIndex(baseWireeoControls, copy.wireeoControls);
    const stats = mergeByIndex(baseStats, copy.stats);
    const projects = mergeByIndex(baseProjects, copy.projects);
    const mediaItems = mergeByIndex(baseMediaItems, copy.mediaItems);
    const youtubeVideos = mergeByIndex(baseYoutubeVideos, copy.youtubeVideos);
    const aboutFeatures = mergeByIndex(baseAboutFeatures, copy.aboutFeatures);
    const processSteps = mergeByIndex(baseProcessSteps, copy.processSteps);
    const contactCards = mergeByIndex(baseContactCards, copy.contactCards);
    const heroSlides = mergeByIndex(baseHeroSlides, copy.heroSlides);

    const pageDropdownItems = [
      { label: copy.pages.about.title, href: '/despre' },
      { label: copy.pages.services.title, href: '/servicii' },
      ...services.map((service) => ({ label: service.title, href: `/servicii/${service.slug}` })),
      { label: copy.pages.portfolio.title, href: '/portofoliu' },
      { label: copy.pages.media.title, href: '/media' },
      { label: copy.pages.contact.title, href: '/contact' },
    ];

    return {
      ...copy,
      language,
      contactInfo: contact,
      siteImages,
      heroSlides,
      services,
      serviceHighlights,
      wireeoControls,
      stats,
      projects,
      mediaItems,
      youtubeVideos,
      aboutFeatures,
      processSteps,
      contactCards,
      pageDropdownItems,
      footerServices: services.map((service) => service.title),
      basePageDropdownItems,
    };
  }, [language]);
}

export function PresentationContentProvider({ children }) {
  const value = usePresentationContentValue();

  return createElement(PresentationContentContext.Provider, { value }, children);
}

export function usePresentationContent() {
  const content = useContext(PresentationContentContext);

  if (!content) {
    throw new Error('usePresentationContent must be used inside PresentationContentProvider');
  }

  return content;
}
