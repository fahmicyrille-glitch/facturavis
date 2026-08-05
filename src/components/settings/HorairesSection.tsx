'use client';

import { useEffect, useState } from 'react';
import { Loader2, Clock, Video, Share2, Code2, CalendarSync, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { HorairesOuverture } from '@/lib/types';
import { buildEmbedSnippet } from '@/lib/use-iframe-embed';

interface HorairesSectionProps {
  userId: string | null;
}

const JOURS: { cle: string; label: string }[] = [
  { cle: '1', label: 'Lundi' },
  { cle: '2', label: 'Mardi' },
  { cle: '3', label: 'Mercredi' },
  { cle: '4', label: 'Jeudi' },
  { cle: '5', label: 'Vendredi' },
  { cle: '6', label: 'Samedi' },
  { cle: '0', label: 'Dimanche' },
];

const DEFAUT: HorairesOuverture = Object.fromEntries(
  JOURS.map((j) => [j.cle, { actif: true, debut: '08:00', fin: '20:00' }])
);

export default function HorairesSection({ userId }: HorairesSectionProps) {
  const [horaires, setHoraires] = useState<HorairesOuverture>(DEFAUT);
  const [dureeConsultation, setDureeConsultation] = useState(60);
  const [visioUrl, setVisioUrl] = useState('');
  const [delaiAnnulation, setDelaiAnnulation] = useState(0);
  const [delaiReservation, setDelaiReservation] = useState(0);
  const [bio, setBio] = useState('');
  const [instructionsAcces, setInstructionsAcces] = useState('');
  const [feedToken, setFeedToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [feedCopied, setFeedCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from('therapeutes')
      .select('horaires_ouverture, duree_consultation, visio_url, delai_annulation_heures, delai_reservation_heures, bio, instructions_acces, calendar_feed_token')
      .eq('id', userId).single()
      .then(({ data }) => {
        if (data?.horaires_ouverture) setHoraires({ ...DEFAUT, ...data.horaires_ouverture });
        if (data?.duree_consultation) setDureeConsultation(data.duree_consultation);
        if (data?.visio_url) setVisioUrl(data.visio_url);
        if (data?.delai_annulation_heures) setDelaiAnnulation(data.delai_annulation_heures);
        if (data?.delai_reservation_heures) setDelaiReservation(data.delai_reservation_heures);
        if (data?.bio) setBio(data.bio);
        if (data?.instructions_acces) setInstructionsAcces(data.instructions_acces);
        if (data?.calendar_feed_token) setFeedToken(data.calendar_feed_token);
        setLoading(false);
      });
  }, [userId]);

  const updateJour = (cle: string, patch: Partial<{ actif: boolean; debut: string; fin: string; pauseDebut: string; pauseFin: string }>) => {
    setHoraires((prev) => ({ ...prev, [cle]: { ...prev[cle], ...patch } }));
  };

  const togglePause = (cle: string, active: boolean) => {
    setHoraires((prev) => ({
      ...prev,
      [cle]: active
        ? { ...prev[cle], pauseDebut: '12:00', pauseFin: '14:00' }
        : { ...prev[cle], pauseDebut: undefined, pauseFin: undefined },
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('therapeutes').update({
      horaires_ouverture: horaires,
      duree_consultation: Math.max(5, Math.min(480, dureeConsultation)),
      visio_url: visioUrl.trim(),
      delai_annulation_heures: Math.max(0, delaiAnnulation),
      delai_reservation_heures: Math.max(0, delaiReservation),
      bio: bio.trim(),
      instructions_acces: instructionsAcces.trim(),
    }).eq('id', userId);
    setMessage(error ? "Erreur lors de l'enregistrement" : 'Réglages enregistrés');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const copyBookingLink = () => {
    if (!userId) return;
    navigator.clipboard.writeText(`${window.location.origin}/reserver/${userId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const copyEmbedSnippet = () => {
    if (!userId) return;
    navigator.clipboard.writeText(buildEmbedSnippet(`${window.location.origin}/reserver/${userId}`));
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2500);
  };

  const copyFeedLink = () => {
    if (!feedToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/api/agenda/feed/${feedToken}`);
    setFeedCopied(true);
    setTimeout(() => setFeedCopied(false), 2500);
  };

  const regenerateFeedToken = async () => {
    if (!userId) return;
    if (!window.confirm("Régénérer le lien invalidera l'ancien — vous devrez le remettre à jour dans votre calendrier. Continuer ?")) return;
    setRegenerating(true);
    const newToken = crypto.randomUUID();
    const { error } = await supabase.from('therapeutes').update({ calendar_feed_token: newToken }).eq('id', userId);
    if (!error) setFeedToken(newToken);
    setRegenerating(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <div className="flex items-center mb-2 border-b pb-4">
        <Clock size={20} className="text-gray-800 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Agenda &amp; réservation en ligne</h2>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        Vos patients peuvent réserver directement leurs rendez-vous sur vos créneaux libres, dans vos horaires d&apos;ouverture.
      </p>

      {/* Lien de réservation partageable */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2"><Share2 size={15} /> Votre lien de prise de rendez-vous</p>
        <p className="text-xs text-blue-700 mb-3">Partagez-le sur votre site, Instagram, WhatsApp ou en signature d&apos;email — vos patients réservent seuls, 24h/24.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyBookingLink}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
          >
            {linkCopied ? '✓ Lien copié !' : 'Copier mon lien'}
          </button>
          <button
            onClick={copyEmbedSnippet}
            className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1.5"
            title="À coller sur votre propre site (WordPress, Wix...) pour que vos patients réservent sans le quitter"
          >
            <Code2 size={13} /> {embedCopied ? '✓ Code copié !' : "Intégrer à mon site (iframe)"}
          </button>
        </div>
      </div>

      {/* Synchronisation avec votre calendrier personnel */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2"><CalendarSync size={15} /> Synchroniser avec votre calendrier personnel</p>
        <p className="text-xs text-gray-500 mb-3">
          Retrouvez vos RDV FacturAvis directement dans Google Calendar ou Apple Calendar. Une fois ajouté, tout nouveau RDV apparaît automatiquement — pas besoin de repasser par ce lien.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={copyFeedLink}
            disabled={!feedToken}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition disabled:opacity-50"
          >
            {feedCopied ? '✓ Lien copié !' : 'Copier le lien de synchronisation'}
          </button>
          <button
            onClick={regenerateFeedToken}
            disabled={regenerating || !feedToken}
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition flex items-center gap-1.5 disabled:opacity-50"
            title="Génère un nouveau lien si l'ancien a fuité — invalide l'ancien"
          >
            {regenerating ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Régénérer
          </button>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          <strong>Google Calendar</strong> : Autres agendas → + → « À partir de l&apos;URL » → collez le lien.<br />
          <strong>Apple Calendar</strong> : Fichier → Nouvel abonnement → collez le lien.
        </p>
      </div>

      {/* Fiche praticien visible des patients */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Présentation (visible sur votre page de réservation)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Quelques mots sur votre pratique, vos spécialités..."
          className="w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
        <p className="text-[11px] text-gray-400 mt-1">Rassure un patient qui découvre votre cabinet via le lien de réservation.</p>
      </div>

      {/* Instructions d'accès — jamais publiques, uniquement dans l'email de confirmation */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Comment accéder au cabinet ? (étage, code, interphone...)</label>
        <textarea
          value={instructionsAcces}
          onChange={(e) => setInstructionsAcces(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={'Ex : 3e étage, code portail 1234A, sonner "Cabinet Dupont"'}
          className="w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
        <p className="text-[11px] text-gray-400 mt-1">
          🔒 Jamais affiché publiquement — envoyé uniquement dans l&apos;email de confirmation et de rappel, une fois le rendez-vous pris.
        </p>
      </div>

      {/* Durée de consultation */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-gray-700">Durée d&apos;une consultation :</label>
        <input
          type="number"
          min={5}
          max={480}
          step={5}
          value={dureeConsultation}
          onChange={(e) => setDureeConsultation(parseInt(e.target.value, 10) || 60)}
          className="w-20 border rounded-lg py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <span className="text-sm text-gray-500">minutes</span>
      </div>

      {/* Lien visio */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5"><Video size={15} className="text-gray-500" /> Lien de visioconférence (optionnel)</label>
        <input
          type="url"
          value={visioUrl}
          onChange={(e) => setVisioUrl(e.target.value)}
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
          className="w-full border rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <p className="text-[11px] text-gray-400 mt-1">Si renseigné, vos patients pourront choisir &quot;consultation en visio&quot; et recevront ce lien dans leur email de confirmation.</p>
      </div>

      <p className="text-sm font-bold text-gray-700 mb-3">Horaires d&apos;ouverture</p>
      <div className="space-y-3">
        {JOURS.map((j) => {
          const h = horaires[j.cle] || DEFAUT[j.cle];
          const hasPause = !!(h.pauseDebut && h.pauseFin);
          return (
            <div key={j.cle} className="p-3 -mx-3 rounded-lg hover:bg-gray-50/60">
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <label className="flex items-center gap-2 w-28 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.actif}
                    onChange={(e) => updateJour(j.cle, { actif: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className={`text-sm font-medium ${h.actif ? 'text-gray-800' : 'text-gray-400'}`}>{j.label}</span>
                </label>
                <input
                  type="time"
                  value={h.debut}
                  disabled={!h.actif}
                  onChange={(e) => updateJour(j.cle, { debut: e.target.value })}
                  className="border rounded-lg py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-300"
                />
                <span className="text-gray-400 text-sm">à</span>
                <input
                  type="time"
                  value={h.fin}
                  disabled={!h.actif}
                  onChange={(e) => updateJour(j.cle, { fin: e.target.value })}
                  className="border rounded-lg py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-300"
                />
                <label className={`flex items-center gap-1.5 text-xs ml-1 ${h.actif ? 'text-gray-500 cursor-pointer' : 'text-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={hasPause}
                    disabled={!h.actif}
                    onChange={(e) => togglePause(j.cle, e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  Pause
                </label>
              </div>
              {hasPause && h.actif && (
                <div className="flex items-center gap-3 mt-2 ml-[7.5rem] pl-0">
                  <span className="text-xs text-gray-400">de</span>
                  <input
                    type="time"
                    value={h.pauseDebut}
                    onChange={(e) => updateJour(j.cle, { pauseDebut: e.target.value })}
                    className="border rounded-lg py-1 px-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-xs text-gray-400">à</span>
                  <input
                    type="time"
                    value={h.pauseFin}
                    onChange={(e) => updateJour(j.cle, { pauseFin: e.target.value })}
                    className="border rounded-lg py-1 px-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[11px] text-gray-400">(ex. pause déjeuner — aucun créneau proposé sur ce créneau)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Délais de réservation en ligne */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-1">Délais de réservation en ligne</p>
        <p className="text-xs text-gray-500 mb-4">Laissez à 0 pour aucune limite (comportement par défaut).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Un patient peut annuler / modifier son RDV jusqu&apos;à
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={720}
                value={delaiAnnulation}
                onChange={(e) => setDelaiAnnulation(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-20 border rounded-lg py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-500">heures avant le RDV</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Un créneau doit être réservé au moins
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={720}
                value={delaiReservation}
                onChange={(e) => setDelaiReservation(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-20 border rounded-lg py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-500">heures à l&apos;avance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Enregistrer
        </button>
        {message && <span className="text-sm text-gray-500">{message}</span>}
      </div>
    </div>
  );
}
