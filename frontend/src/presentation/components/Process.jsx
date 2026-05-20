import AnimatedSection from './AnimatedSection';
import IconBubble from './cards/IconBubble';
import RevealCard from './cards/RevealCard';
import SectionTitle from './SectionTitle';
import { usePresentationContent } from '../data/usePresentationContent';

export default function Process() {
  const { process, processSteps } = usePresentationContent();

  return (
    <AnimatedSection id="proces" className="relative overflow-hidden bg-fog py-24">
      <div className="absolute inset-x-0 top-0 h-24 bg-white diagonal-bottom" />
      <div className="section-shell container-px relative pt-8">
        <SectionTitle
          kicker={process.kicker}
          title={process.title}
          copy={process.copy}
          align="center"
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <RevealCard
                className="relative"
                key={step.number}
                index={index}
                delayStep={0.1}
                duration={0.6}
                viewportAmount={0.2}
                y={36}
              >
                {index < processSteps.length - 1 && (
                  <div className="absolute right-0 top-10 hidden h-px w-1/2 translate-x-full bg-gradient-to-r from-emerald/40 to-transparent lg:block" />
                )}
                <div className="h-full rounded-lg border border-emerald/10 bg-white p-6 shadow-xl shadow-emerald/10">
                  <div className="mb-5 flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-black text-white">
                      {step.number}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald/30 to-transparent" />
                  </div>
                  <IconBubble icon={Icon} iconClassName="text-emerald" size={26} strokeWidth={1.7} />
                  <h3 className="text-lg font-black uppercase text-graphite">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
                </div>
              </RevealCard>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
