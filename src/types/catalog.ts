export interface PublicQuestionnaireSummary {
  /** Identifiant Firebase (clé sous /questionnaires_publics). */
  firebaseId: string;
  titre: string;
  auteur: string | null;
  date_publication: number;
  nb_questions: number;
}

export interface CachedPublicQuestionnaire extends PublicQuestionnaireSummary {
  /** Identifiant local (questionnaire SQLite téléchargé). */
  localId: string;
  date_telecharge: number;
}
