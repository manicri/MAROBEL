/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import InstagramGallery from "./components/InstagramGallery";
import ReservationForm from "./components/ReservationForm";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotificationManager } from "./components/NotificationManager";
import { Toaster } from "sonner";
import React from 'react';

function MainContent() {
  const { isAdmin } = useAuth();
  const [showAdmin, setShowAdmin] = React.useState(false);

  React.useEffect(() => {
    const handleHash = () => setShowAdmin(window.location.hash === '#admin' || window.location.hash === '#admin-marobel');
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (showAdmin && isAdmin) {
    return (
      <div className="min-h-screen bg-brand-offwhite pt-32 pb-24 px-6">
        <div className="container mx-auto">
          <AdminDashboard />
        </div>
      </div>
    );
  }

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

export default function App() {
  return (
    <AuthProvider>
      <NotificationManager />
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen selection:bg-brand-cream selection:text-brand-brown">
        <Navbar />
        <MainContent />
        <Footer />
        <WhatsAppButton />
      </div>
    </AuthProvider>
  );
}
