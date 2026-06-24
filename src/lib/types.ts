export interface Cabinet {
  id: string;
  nom: string;
  lien_avis_google: string;
}

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
  created_at?: string;
}

export interface Patient {
  id: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  adresse?: string;
  num_secu?: string;
  notes_consultation: string;
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

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}
