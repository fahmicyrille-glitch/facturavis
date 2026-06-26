'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AutoLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ⏱️ Temps d'inactivité avant déconnexion.
  // Actuellement sur 90 minutes (90 min * 60 sec * 1000 ms)
  // Astuce : remplace le 90 par 30 si tu veux renforcer la sécurité médicale
  const INACTIVITY_TIME = 90 * 60 * 1000;

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push('/');
    }, INACTIVITY_TIME);
  }, [router]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  return null;
}
