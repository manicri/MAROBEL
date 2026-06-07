import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import InstagramGallery from "../components/InstagramGallery";
import { PublicPromotions } from "../components/PublicPromotions";
import ReservationForm from "@/components/ReservationForm";

export default function Home() {
  return (
    <main>
      <Hero />
      <PublicPromotions />
      <About />
      <InstagramGallery />
      <Services />
      <section id="reservas">
        <ReservationForm />
      </section>
    </main>
  );
}
