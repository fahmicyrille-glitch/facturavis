'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, Send, AlertCircle, MessageSquare,
} from 'lucide-react';
import Reveal from './Reveal';

export default function ContactForm() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setIsSent(true);
        setContactForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setIsSent(false), 5000);
      } else {
        let errorMsg = "Oups, une erreur est survenue lors de l'envoi.";
        try {
            const data = await response.json();
            if(data.error) errorMsg = data.error;
        } catch(e) {}
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      setErrorMessage("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-white border-t border-[#f0e6de] px-4 md:px-6 scroll-mt-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#f0e6de] to-transparent"></div>
      <Reveal variant="up" className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#fdf2e9] text-[#a9825a] rounded-full mb-6 shadow-sm border border-[#f0e6de]">
          <MessageSquare size={24} className="md:w-8 md:h-8" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-[#3e2f25] mb-4">
          Un besoin spécifique pour votre cabinet ?
        </h2>
        <p className="text-[#7a6a5f] text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto">
          Nous développons FacturAvis pour qu&apos;il s&apos;adapte à <span className="font-bold text-[#3e2f25]">votre</span> réalité terrain. Si vous avez une demande particulière, notre équipe est à votre écoute.
        </p>

        <form onSubmit={handleContactSubmit} className="max-w-md mx-auto bg-[#fcfaf8] p-6 md:p-8 rounded-[32px] border border-[#f0e6de] shadow-xl text-left space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Nom complet</label>
            <input
              id="name" required type="text" placeholder="Dr. Dupont" value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 transition-all font-medium"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Email professionnel</label>
            <input
              id="email" required type="email" placeholder="cabinet@email.com" value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 transition-all font-medium"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Téléphone (optionnel)</label>
            <input
              id="phone" type="tel" placeholder="06 12 34 56 78" value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 transition-all font-medium"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-black text-[#3e2f25] uppercase tracking-widest mb-2">Votre besoin</label>
            <textarea
              id="message" required rows={4} placeholder="Décrivez votre besoin spécifique..." value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#a9825a] focus:ring-2 focus:ring-[#a9825a]/20 bg-white text-[#3e2f25] placeholder-gray-400 resize-none transition-all font-medium"
            />
          </div>

           {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {isSent && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</p>
            </div>
          )}

          <button
            type="submit" disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#a9825a] hover:bg-[#8b6a48] text-white font-black px-6 py-4 rounded-2xl transition-all disabled:opacity-70 group shadow-lg shadow-[#a9825a]/30"
          >
            {isSubmitting ? (
              <>
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Envoyer ma demande
              </>
            )}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
