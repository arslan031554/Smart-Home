import InfoCard from './cards/InfoCard';
import { usePresentationContent } from '../data/usePresentationContent';

export default function ContactCards() {
  const { contactCards } = usePresentationContent();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {contactCards.map((item, index) => {
        return (
          <InfoCard
            icon={item.icon}
            index={index}
            label={item.label}
            title={item.value}
            href={item.href}
            key={item.label}
          />
        );
      })}
    </div>
  );
}
