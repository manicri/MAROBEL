import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import InstagramGallery from "../components/InstagramGallery";
import ReservationForm from "../components/ReservationForm";
import { PublicPromotions } from "../components/PublicPromotions";

export default function Home() {
  return (
    <main>
      <Hero />
      <PublicPromotions />
      <About />
      <Services />
      <InstagramGallery />
      <ReservationForm />
    </main>
  );
}
