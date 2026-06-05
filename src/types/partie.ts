export type PartieMode = 'online' | 'lan';

export type PartieStatut =
  | 'lobby'
  | 'verrouille'
  | 'tournoi'
  | 'duel'
  | 'fin';

export type QuestionnaireStatut = 'verrouille' | 'termine';

export type QuestionnaireSource = 'pdf' | 'ia' | 'public';

export interface Partie {
  id: string;
  nom: string;
  mode: PartieMode;
  code: string | null;
  statut: PartieStatut;
  equipe_gagnante_id: string | null;
  date_creation: number;
  date_fin: number | null;
}
