export interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

export interface HoraireJour {
  actif: boolean;
  debut: string;
  fin: string;
  // Coupure quotidienne optionnelle (ex. pause déjeuner) : les deux doivent être renseignés
  // pour être prise en compte, sinon ignorée.
  pauseDebut?: string;
  pauseFin?: string;
}

// Clés : '0' (dimanche) à '6' (samedi), comme Date.getDay().
export type HorairesOuverture = Record<string, HoraireJour>;

export interface Therapeute {
  id: string;
  nom: string;
  titre: string;
  telephone: string;
  email: string;
  logo_url: string;
  adresse_cabinet?: string;
  siret?: string;
  code_ape?: string;
  adeli?: string;
  site_web?: string;
  signature_url?: string;
  horaires_ouverture?: HorairesOuverture;
  duree_consultation?: number;
  visio_url?: string;
  delai_annulation_heures?: number;
  delai_reservation_heures?: number;
  bio?: string;
  instructions_acces?: string;
  calendar_feed_token?: string;
  created_at?: string;
}

export interface Anamnese {
  motif?: string;
  antecedents?: string;
  traitements?: string;
  allergies?: string;
  mode_de_vie?: string;
}

export interface Patient {
  id: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  adresse?: string;
  num_secu?: string;
  date_naissance?: string | null;
  notes_consultation: string;
  anamnese?: Anamnese;
}

export interface Facture {
  id: string;
  created_at: string;
  patient_nom: string;
  patient_email: string;
  cabinet_id: string;
  fichier_path: string;
  note: number | null;
  commentaire: string | null;
  statut_email: string;
  montant: number;
  mode_reglement: string | null;
  statut: string | null;
  therapeute_id?: string;
  note_at?: string | null;
  avis_google_click_at?: string | null;
  relance_avis_envoye?: boolean;
}

export interface Prestation {
  id: string;
  nom: string;
  prix: number;
}

export interface FactureHistorique {
  id: string;
  created_at: string;
  montant: number;
  statut: string | null;
  fichier_path: string;
  note: number | null;
  commentaire: string | null;
  mode_reglement: string | null;
  statut_email: string;
  patient_nom?: string;
}

export interface Prospect {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession: string;
  statut?: string;
}

export interface FactureRecue {
  id: string;
  therapeute_id: string;
  fournisseur_nom: string;
  montant: number | null;
  date_facture: string | null;
  categorie: string;
  notes: string;
  fichier_path: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  therapeute_id: string;
  date_consultation: string;
  notes: string;
  facture_id: string | null;
  rendez_vous_id: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  therapeute_id: string;
  consultation_id: string | null;
  patient_id: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}

export interface RendezVous {
  id: string;
  therapeute_id: string;
  patient_id: string | null;
  cabinet_id: string | null;
  titre: string;
  date_debut: string;
  date_fin: string;
  statut: 'confirme' | 'en_attente' | 'annule' | 'termine';
  notes: string;
  patient_email: string;
  patient_telephone: string;
  patient_nom: string;
  mode: 'cabinet' | 'visio';
  rappel_envoye: boolean;
  motif_id: string | null;
  motif_nom: string;
  type: 'consultation' | 'indisponibilite';
  created_at: string;
}

export interface MotifConsultation {
  id: string;
  therapeute_id: string;
  nom: string;
  duree_minutes: number;
  actif: boolean;
  ordre: number;
  created_at: string;
}

export interface ListeAttente {
  id: string;
  therapeute_id: string;
  nom: string;
  email: string;
  telephone: string;
  notifie: boolean;
  created_at: string;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}
