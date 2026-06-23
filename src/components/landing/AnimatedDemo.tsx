'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Send, Star, CheckCircle, Download, Mail,
  Clock, ArrowRight, Sparkles, User, Euro
} from 'lucide-react';

const STEPS = [
  {
    id: 'form',
    title: 'Le praticien facture en 10 secondes',
    subtitle: 'Formulaire pré-rempli, un clic suffit',
  },
  {
    id: 'send',
    title: 'La facture part instantanément',
    subtitle: 'Le patient reçoit un email professionnel',
  },
  {
    id: 'review',
    title: "L'avis Google tombe automatiquement",
    subtitle: 'Le patient note le cabinet en téléchargeant sa facture',
  },
];

export default function AnimatedDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % STEPS.length);
        setIsAnimating(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#f0e6de] px-4 md:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#fdf2e9] text-[#a9825a] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-[#f0e6de] mb-6">
            <Clock size={14} /> Démo en direct
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#3e2f25] mb-4 tracking-tighter">
            De la séance à l&apos;avis Google <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b494] to-[#a9825a]">en 30 secondes.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Steps indicator */}
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => { setActiveStep(i); setIsAnimating(false); }}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-500 ${
                  activeStep === i
                    ? 'border-[#a9825a] bg-[#fdf2e9] shadow-lg shadow-[#a9825a]/10'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                    activeStep === i
                      ? 'bg-[#a9825a] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className={`font-black text-base transition-colors ${
                      activeStep === i ? 'text-[#3e2f25]' : 'text-gray-400'
                    }`}>{step.title}</p>
                    <p className={`text-sm mt-1 transition-colors ${
                      activeStep === i ? 'text-[#7a6a5f]' : 'text-gray-300'
                    }`}>{step.subtitle}</p>
                  </div>
                </div>
                {activeStep === i && (
                  <div className="mt-3 ml-14">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#a9825a] rounded-full animate-progress" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Right: Animated screen */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#d4b494]/20 to-[#a9825a]/20 rounded-[2rem] blur-2xl -z-10" />
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 ml-3">facturavis.fr</div>
              </div>

              {/* Screen content */}
              <div className={`p-6 min-h-[320px] md:min-h-[380px] transition-opacity duration-400 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                {activeStep === 0 && <StepForm />}
                {activeStep === 1 && <StepEmail />}
                {activeStep === 2 && <StepReview />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 3.5s linear;
        }
      `}</style>
    </section>
  );
}

function StepForm() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" /> Nouvelle Facture
        </h3>
        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">Factur-X 2026</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Patient</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
            <User size={14} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-800">Mme MARTIN Sophie</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase">Email</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
            <Mail size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">s.martin@email.com</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Consultation Ostéopathie</span>
          <span className="font-black text-gray-900 flex items-center gap-1"><Euro size={14} /> 60,00</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
          <Send size={16} /> Émettre la facture
        </div>
        <div className="bg-white border border-gray-200 text-gray-600 py-3 px-4 rounded-xl font-bold text-sm flex items-center gap-2">
          <FileText size={16} /> Aperçu
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <Clock size={12} />
        <span>Temps estimé : <span className="font-bold text-gray-600">10 secondes</span></span>
      </div>
    </div>
  );
}

function StepEmail() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={20} />
        <span className="font-black text-sm">Facture envoyée avec succès !</span>
      </div>

      {/* Email preview */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a9825a] flex items-center justify-center">
            <span className="text-white font-black text-sm">HF</span>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">Dr. Hilary Farid</p>
            <p className="text-[10px] text-gray-400">Ostéopathe D.O. — Cabinet de Sèvres</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-600 mb-1"><span className="font-bold">À :</span> s.martin@email.com</p>
          <p className="text-xs text-gray-600"><span className="font-bold">Objet :</span> Votre facture de consultation</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">Bonjour <span className="font-bold text-[#a9825a]">Mme MARTIN</span>, votre facture est disponible. Ce document vous sera utile pour votre remboursement mutuelle.</p>
          <div className="mt-3 bg-[#a9825a] text-white text-center py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
            <Download size={14} /> Télécharger ma facture
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <Mail size={12} />
        <span>Email reçu par le patient en <span className="font-bold text-gray-600">moins de 30 secondes</span></span>
      </div>
    </div>
  );
}

function StepReview() {
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStars(1), 300),
      setTimeout(() => setStars(2), 500),
      setTimeout(() => setStars(3), 700),
      setTimeout(() => setStars(4), 900),
      setTimeout(() => setStars(5), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-bold text-gray-600 mb-2">Le patient télécharge sa facture...</p>
        <div className="flex justify-center gap-2 mb-4">
          <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
            <CheckCircle size={14} /> Facture téléchargée
          </div>
        </div>
      </div>

      <div className="bg-[#fdf2e9] rounded-xl p-5 border border-[#f0e6de] text-center">
        <p className="font-black text-lg text-[#3e2f25] mb-1">Soutenez le cabinet !</p>
        <p className="text-sm text-[#7a6a5f] mb-4">Évaluez votre séance pour aider d&apos;autres patients.</p>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={36}
              className={`transition-all duration-300 ${
                s <= stars
                  ? 'fill-yellow-400 text-yellow-400 scale-110'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        {stars === 5 && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm mb-2">
              <Sparkles size={16} className="text-yellow-500" />
              Redirection vers Google Maps...
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-lg">G</div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">Avis Google — Cabinet de Sèvres</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.9 (127 avis)
                  <span className="text-green-600 font-bold ml-1">+1 nouveau !</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <ArrowRight size={12} />
        <span>Résultat : <span className="font-bold text-green-600">+300% d&apos;avis Google en moyenne</span></span>
      </div>
    </div>
  );
}
