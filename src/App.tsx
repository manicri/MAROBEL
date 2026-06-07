/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SelectionProvider } from "./context/SelectionContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ServiciosPage from "./pages/ServiciosPage";
import ReservationForm from "./components/ReservationForm";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotificationManager } from "./components/NotificationManager";
import { Toaster } from "sonner";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";

const routerBasename = import.meta.env.BASE_URL;

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <SelectionProvider>
          <NotificationManager />
          <Toaster position="top-right" richColors closeButton />
          <div className="selection:bg-brand-cream selection:text-brand-brown">
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/servicios" element={<ServiciosPage />} />
                <Route path="/reserva" element={<ReservationForm />} />
                <Route path="/admin" element={
                  <div className="min-h-screen bg-brand-offwhite pt-32 pb-24 px-6">
                    <div className="container mx-auto">
                      <AdminDashboard />
                    </div>
                  </div>
                } />
              </Route>
            </Routes>
            <Footer />
            <WhatsAppButton />
          </div>
        </SelectionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
