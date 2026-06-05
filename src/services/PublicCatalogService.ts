import {
  get,
  getDatabase,
  ref,
  serverTimestamp,
  set,
} from '@react-native-firebase/database';
import {v4 as uuidv4} from 'uuid';

import {PublicCatalogRepository} from '@/data/sqlite/PublicCatalogRepository';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import {HOST_TOKEN} from '@/data/sqlite/hostToken';
import type {CreateQuestionInput} from '@/types/repository';
import type {QuestionOptions} from '@/types/question';
import type {PublicQuestionnaireSummary} from '@/types/catalog';

const CATALOG_ROOT = 'questionnaires_publics';

interface PublicQuestionNode {
  texte: string;
  options: QuestionOptions;
  reponse_correcte: string;
}

interface PublicQuestionnaireNode {
  titre: string;
  auteur: string | null;
  date_publication: number;
  nb_questions: number;
  questions: PublicQuestionNode[];
}

interface PublicCatalogServiceDeps {
  questionnaireRepo?: QuestionnaireRepository;
  cacheRepo?: PublicCatalogRepository;
}

/**
 * Catalogue public partagé via Firebase RTDB. Les questionnaires publics
 * incluent `reponse_correcte` (lecture seule), contrairement aux sessions.
 */
export class PublicCatalogService {
  private readonly db = getDatabase();
  private readonly questionnaireRepo: QuestionnaireRepository;
  private readonly cacheRepo: PublicCatalogRepository;

  constructor(deps: PublicCatalogServiceDeps = {}) {
    this.questionnaireRepo =
      deps.questionnaireRepo ?? new QuestionnaireRepository();
    this.cacheRepo = deps.cacheRepo ?? new PublicCatalogRepository();
  }

  /** Publie un questionnaire `is_public` vers le catalogue. */
  async publish(questionnaireId: string, auteur: string | null): Promise<void> {
    const meta = this.questionnaireRepo.getQuestionnaireMeta(questionnaireId);
    if (!meta) {
      throw new Error('Questionnaire introuvable.');
    }
    if (!meta.is_public) {
      return; // non public : rien à publier
    }

    const questions = this.questionnaireRepo.getQuestionsForHost(
      questionnaireId,
      HOST_TOKEN,
    );

    const node: PublicQuestionnaireNode = {
      titre: meta.titre,
      auteur,
      date_publication: serverTimestamp() as unknown as number,
      nb_questions: questions.length,
      questions: questions.map(q => ({
        texte: q.texte_question,
        options: q.options,
        reponse_correcte: q.reponse_correcte,
      })),
    };

    await set(ref(this.db, `${CATALOG_ROOT}/${questionnaireId}`), node);
  }

  /** Publie tous les questionnaires `is_public` d'une partie (fin de partie). */
  async publishPartiePublics(
    partieId: string,
    auteur: string | null,
  ): Promise<void> {
    const publics = this.questionnaireRepo.listPublicByPartie(partieId);
    for (const meta of publics) {
      await this.publish(meta.id, auteur);
    }
  }

  /** Liste les questionnaires disponibles dans le catalogue. */
  async fetchPublicList(): Promise<PublicQuestionnaireSummary[]> {
    const snapshot = await get(ref(this.db, CATALOG_ROOT));
    const list: PublicQuestionnaireSummary[] = [];
    snapshot.forEach(child => {
      const value = child.val() as PublicQuestionnaireNode | null;
      if (value && child.key) {
        list.push({
          firebaseId: child.key,
          titre: value.titre,
          auteur: value.auteur ?? null,
          date_publication: Number(value.date_publication) || 0,
          nb_questions: Number(value.nb_questions) || 0,
        });
      }
      return undefined;
    });
    return list;
  }

  /**
   * Télécharge un questionnaire public et l'enregistre en SQLite (source
   * `public`) + cache local. Retourne l'id local du questionnaire.
   */
  async downloadQuestionnaire(firebaseId: string): Promise<string> {
    const existingLocalId = this.cacheRepo.getLocalId(firebaseId);
    if (existingLocalId) {
      return existingLocalId;
    }

    const snapshot = await get(ref(this.db, `${CATALOG_ROOT}/${firebaseId}`));
    const node = snapshot.val() as PublicQuestionnaireNode | null;
    if (!node) {
      throw new Error('Questionnaire public introuvable.');
    }

    const localId = uuidv4();
    const questions: CreateQuestionInput[] = node.questions.map(q => ({
      texte: q.texte,
      options: q.options,
      reponse_correcte: q.reponse_correcte,
    }));

    this.questionnaireRepo.createQuestionnaire({
      id: localId,
      titre: node.titre,
      source: 'public',
      questions,
    });

    this.cacheRepo.insertCache(
      {
        firebaseId,
        titre: node.titre,
        auteur: node.auteur ?? null,
        date_publication: Number(node.date_publication) || 0,
        nb_questions: questions.length,
      },
      localId,
    );

    return localId;
  }
}
