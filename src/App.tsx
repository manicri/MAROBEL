/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SelectionProvider } from "./context/SelectionContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Cabello from "./pages/Cabello";
import Unas from "./pages/Unas";
import EsteticaFacial from "./pages/EsteticaFacial";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotificationManager } from "./components/NotificationManager";
import { Toaster } from "sonner";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SelectionProvider>
          <NotificationManager />
          <Toaster position="top-right" richColors closeButton />
          <div className="selection:bg-brand-cream selection:text-brand-brown">
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/cabello" element={<Cabello />} />
                <Route path="/unas" element={<Unas />} />
                <Route path="/estetica-facial" element={<EsteticaFacial />} />
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
