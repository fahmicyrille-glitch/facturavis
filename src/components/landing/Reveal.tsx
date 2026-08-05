'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'zoom';

const HIDDEN: Record<RevealVariant, string> = {
  up: 'opacity-0 translate-y-12',
  fade: 'opacity-0',
  left: 'opacity-0 -translate-x-12',
  right: 'opacity-0 translate-x-12',
  zoom: 'opacity-0 scale-90',
};

const VISIBLE = 'opacity-100 translate-y-0 translate-x-0 scale-100';

// Anime l'apparition d'un bloc au scroll (fade + léger déplacement), une seule fois,
// via IntersectionObserver — pas de librairie externe, cohérent avec le reste du site
// qui n'utilise que des animations CSS/Tailwind faites main (voir globals.css).
export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 700,
  className = '',
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respecte la préférence utilisateur "mouvement réduit" : contenu affiché direct
    // (setState différé à la frame suivante pour rester hors du corps synchrone de l'effect).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out will-change-transform ${visible ? VISIBLE : HIDDEN[variant]} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
