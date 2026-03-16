'use client';

import { useState } from 'react';
import { Star, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FondateurPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // On envoie les données directement dans ta table Supabase
      const { error } = await supabase
        .from('prospects')
        .insert([{ nom, prenom, email, telephone }]);

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">

      {/* HEADER */}
      <header className="w-full p-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="font-bold text-2xl tracking-tight text-blue-600">FacturAvis<span className="text-slate-900">.</span></div>
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Retour à l'accueil</Link>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-6">
          <Star size={14} className="fill-current" /> Offre lancement (Places limitées)
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Transformez vos factures en <span className="text-blue-600">Avis Google 5⭐</span>
        </h1>

        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Le premier outil conçu pour les ostéopathes qui envoie vos factures PDF en 2 clics et relance automatiquement vos patients pour booster votre visibilité locale.
        </p>

        {/* CADRE OFFRE FONDATEUR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 max-w-2xl mx-auto shadow-sm text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>

          <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Membre Fondateur</h2>
              <p className="text-sm text-slate-500 font-semibold mt-1">Accès complet à vie.</p>
            </div>
            <div className="text-right">
              <div className="text-slate-400 line-through font-bold text-lg">29€ / mois</div>
              <div className="text-4xl font-bold text-blue-600">19€<span className="text-lg text-slate-500 font-semibold">/mois</span></div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center font-semibold text-slate-700">
              <CheckCircle className="text-emerald-500 mr-3" size={20} /> Envoi de factures illimité
            </div>
            <div className="flex items-center font-semibold text-slate-700">
              <CheckCircle className="text-emerald-500 mr-3" size={20} /> Système intelligent de récolte d'avis
            </div>
            <div className="flex items-center font-semibold text-slate-700">
              <CheckCircle className="text-emerald-500 mr-3" size={20} /> Espace compta exportable
            </div>
          </div>

          {/* LE FORMULAIRE */}
          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-in fade-in duration-500">
              <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-900 mb-1">Inscription confirmée !</h3>
              <p className="text-sm font-medium text-emerald-700">Merci {prenom}, nous allons vous contacter très vite pour activer votre compte à 19€/mois.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                  <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Jean" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                  <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dupont" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail professionnel *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="cabinet@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                  <input type="tel" required value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="06 12 34 56 78" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 text-white font-bold text-sm px-6 py-3.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-sm disabled:bg-slate-400">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Réserver ma place <ArrowRight size={16} className="ml-2" /></>}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-xs font-semibold text-slate-400 mt-4 text-center">Aucune carte bancaire requise aujourd'hui. Vous testez d'abord.</p>
          )}
        </div>
      </main>

    </div>
  );
}
