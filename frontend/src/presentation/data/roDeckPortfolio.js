export function localizePortfolioRo(portfolio) {
  const projectCopy = [
    { title: 'Locuință rezidențială', type: 'Locuință rezidențială', location: 'București', result: 'Consum de energie redus cu 28%' },
    { title: 'Clădire de birouri', type: 'Clădire de birouri', location: 'Cluj-Napoca', result: 'Control total dintr-o singură aplicație' },
    { title: 'Hotel 4*', type: 'Hotel 4*', location: 'Brașov', result: 'Confort și economie pentru fiecare cameră' },
    { title: 'Fabrică', type: 'Fabrică', location: 'Timișoara', result: 'Monitorizare și procese optimizate' },
    { title: 'Spital', type: 'Spital', location: 'Pitești', result: 'Siguranță și control acces' },
    { title: 'Depozit', type: 'Depozit', location: 'Oradea', result: 'Securitate și eficiență energetică' },
  ];

  return {
    ...portfolio,
    title: 'Proiecte smart building cu rezultate măsurabile.',
    supportingHeadline: 'Experiență integrată pentru locuințe, birouri, hoteluri, industrie și spații publice.',
    heroDescription: 'Descoperă proiecte în care tehnologia, confortul, siguranța și eficiența energetică funcționează împreună.',
    filters: ['Toate', 'Locuințe', 'Birouri', 'Hotel', 'Spital', 'Fabrică', 'Depozit'],
    projects: portfolio.projects.map((project, index) => ({ ...project, ...projectCopy[index] })),
    longForm: [
      'Portofoliul Green Electric reunește proiecte rezidențiale, comerciale, medicale și industriale în care sistemele clădirii sunt proiectate să funcționeze împreună.',
      'Fiecare proiect începe cu analiza spațiului și a modului de utilizare, continuă cu proiectarea și integrarea tehnică și este finalizat prin punere în funcțiune și suport.',
      'Rezultatele includ confort mai bun, consum redus, control simplificat, siguranță sporită și o infrastructură pregătită pentru extinderi viitoare.',
    ],
    closingTitle: 'Pregătit să construiești următorul proiect inteligent?',
    closingDescription: 'Configurează proiectul și primește o propunere adaptată clădirii tale.',
    closingCta: 'Configurează un proiect →',
    seoTitle: 'Portofoliu smart building | Green Electric',
    seoDescription: 'Proiecte Green Electric pentru locuințe, birouri, hoteluri, spitale, fabrici și depozite.',
  };
}
