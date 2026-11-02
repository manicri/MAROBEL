import { motion } from "motion/react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/593969272530"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Marobel por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#218C56] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#197344] transition-colors"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M20.5 11.8a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z" />
        <path d="m8 7 1.5 3-1 1c1 2 2.5 3.5 4.5 4.5l1-1 3 1.5c-.4 1.7-1.3 2-2.5 1.7C10.2 16.7 7.3 13.8 6.3 9.5 6 8.3 6.3 7.4 8 7Z" transform="translate(1 -1) scale(.94)" />
      </svg>
    </motion.a>
  );
}
