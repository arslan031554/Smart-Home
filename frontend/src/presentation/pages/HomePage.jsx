import CTA from '../components/CTA';
import HeroSlider from '../components/HeroSlider';
import Innovation from '../components/Innovation';
import Media from '../components/Media';
import Portfolio from '../components/Portfolio';
import Services from '../components/Services';
import Stats from '../components/Stats';

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <Services />
      <Innovation />
      <Stats />
      <Portfolio />
      <Media />
      <CTA />
    </>
  );
}
