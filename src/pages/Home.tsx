import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import InstagramGallery from "../components/InstagramGallery";
import ReservationForm from "../components/ReservationForm";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <InstagramGallery />
      <ReservationForm />
    </main>
  );
}
