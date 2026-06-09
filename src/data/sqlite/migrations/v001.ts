export const MIGRATION_V001_SQL = `
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS parties (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('online', 'lan')),
    code TEXT,
    statut TEXT NOT NULL CHECK(statut IN ('lobby', 'verrouille', 'tournoi', 'duel', 'fin')),
    equipe_gagnante_id TEXT,
    date_creation INTEGER NOT NULL,
    date_fin INTEGER
);

CREATE TABLE IF NOT EXISTS questionnaires (
    id TEXT PRIMARY KEY,
    partie_id TEXT,
    titre TEXT NOT NULL,
    date_creation INTEGER NOT NULL,
    statut TEXT NOT NULL CHECK(statut IN ('verrouille', 'termine')) DEFAULT 'verrouille',
    source TEXT NOT NULL CHECK(source IN ('pdf', 'ia', 'public')),
    is_public INTEGER NOT NULL DEFAULT 0,
    duel_id TEXT,
    round_index INTEGER,
    FOREIGN KEY (partie_id) REFERENCES parties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    questionnaire_id TEXT NOT NULL,
    index_ordre INTEGER NOT NULL,
    texte_question TEXT NOT NULL,
    options TEXT NOT NULL,
    reponse_correcte TEXT NOT NULL,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historique_parties (
    id TEXT PRIMARY KEY,
    partie_id TEXT NOT NULL,
    date_partie INTEGER NOT NULL,
    nom_partie TEXT NOT NULL,
    nom_questionnaire TEXT NOT NULL,
    equipe_gagnante TEXT NOT NULL,
    mode TEXT NOT NULL,
    FOREIGN KEY (partie_id) REFERENCES parties(id)
);

CREATE TABLE IF NOT EXISTS classement_joueurs (
    pseudo TEXT PRIMARY KEY,
    points_totaux INTEGER NOT NULL DEFAULT 0,
    parties_jouees INTEGER NOT NULL DEFAULT 0,
    victoires INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questionnaires_publics_cache (
    id TEXT PRIMARY KEY,
    titre TEXT NOT NULL,
    auteur TEXT,
    date_publication INTEGER NOT NULL,
    nb_questions INTEGER NOT NULL,
    firebase_id TEXT NOT NULL UNIQUE,
    date_telecharge INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_questionnaire ON questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_partie ON questionnaires(partie_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_duel ON questionnaires(duel_id);
`;
