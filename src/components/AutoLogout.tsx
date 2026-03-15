'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AutoLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ⏱️ Temps d'inactivité avant déconnexion.
  // Actuellement sur 90 minutes (90 min * 60 sec * 1000 ms)
  // Astuce : remplace le 90 par 30 si tu veux renforcer la sécurité médicale
  const INACTIVITY_TIME = 90 * 60 * 1000;

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      // Le temps est écoulé : on déconnecte et on renvoie à l'accueil
      await supabase.auth.signOut();
      router.push('/');
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    // 👁️ La liste des actions qui prouvent que l'utilisateur est devant son écran
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // On écoute ces actions
    events.forEach(event => window.addEventListener(event, resetTimer));

    // On lance le chrono une première fois
    resetTimer();

    // Nettoyage quand on quitte la page
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}
