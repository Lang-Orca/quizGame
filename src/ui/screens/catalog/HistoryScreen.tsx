import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {HistoriqueRepository} from '@/data/sqlite/HistoriqueRepository';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import type {QuestionHostView} from '@/data/sqlite/QuestionnaireRepository';
import type {QuestionnaireMeta} from '@/types/repository';
import type {HistoriqueEntry} from '@/types/repository';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {Icon} from '@/ui/components/Icon';
import {useColors} from '@/ui/theme';

const historiqueRepo = new HistoriqueRepository();
const questionnaireRepo = new QuestionnaireRepository();

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('fr-FR');
}

export function HistoryScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<HistoriqueEntry[]>([]);
  const [selectedPartie, setSelectedPartie] = useState<HistoriqueEntry | null>(
    null,
  );
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireMeta[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<QuestionHostView[]>([]);
  const [reviewTitre, setReviewTitre] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(historiqueRepo.getAll());
  }, []);

  const lettres = useMemo(() => ['A', 'B', 'C', 'D'], []);

  const ouvrirPartie = (entry: HistoriqueEntry) => {
    setError(null);
    setReviewQuestions([]);
    setSelectedPartie(entry);
    const list = questionnaireRepo
      .listByPartie(entry.partie_id)
      .filter(q => q.statut === 'termine');
    setQuestionnaires(list);
  };

  const reviser = (meta: QuestionnaireMeta) => {
    setError(null);
    try {
      const questions = questionnaireRepo.getQuestionsForReview(meta.id);
      setReviewQuestions(questions);
      setReviewTitre(meta.titre);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Révision impossible.');
    }
  };

  const retour = () => {
    if (reviewQuestions.length > 0) {
      setReviewQuestions([]);
      return;
    }
    setSelectedPartie(null);
    setQuestionnaires([]);
  };

  if (reviewQuestions.length > 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={retour}>
          <ThemedText primary semibold>
            ← Retour
          </ThemedText>
        </TouchableOpacity>
        <ThemedText size="xxl" bold>
          {reviewTitre}
        </ThemedText>
        {reviewQuestions.map((q, i) => (
          <ThemedView
            key={q.id}
            style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.cardBorder}]}>
            <ThemedText semibold size="sm">
              {i + 1}. {q.texte_question}
            </ThemedText>
            {q.options.map((opt, idx) => {
              const correcte = opt === q.reponse_correcte;
              return (
                <ThemedText
                  key={idx}
                  size="sm"
                  secondary={!correcte}
                  success={correcte}
                  bold={correcte}>
                  {lettres[idx]}. {opt}
                  {correcte ? '  ✓' : ''}
                </ThemedText>
              );
            })}
          </ThemedView>
        ))}
      </ScrollView>
    );
  }

  if (selectedPartie) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={retour}>
          <ThemedText primary semibold>
            ← Retour
          </ThemedText>
        </TouchableOpacity>
        <ThemedText size="xxl" bold>
          {selectedPartie.nom_partie}
        </ThemedText>
        <ThemedText size="xs" tertiary>
          Gagnant : {selectedPartie.equipe_gagnante} ·{' '}
          {formatDate(selectedPartie.date_partie)}
        </ThemedText>
        {error ? <ThemedText error>{error}</ThemedText> : null}
        <ThemedText semibold size="base" secondary style={styles.section}>
          Questionnaires révisables
        </ThemedText>
        {questionnaires.length === 0 ? (
          <ThemedText tertiary>Aucun questionnaire terminé pour cette partie.</ThemedText>
        ) : (
          questionnaires.map(meta => (
            <TouchableOpacity
              key={meta.id}
              style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.cardBorder}]}
              onPress={() => reviser(meta)}>
              <ThemedText semibold size="sm">
                {meta.titre}
              </ThemedText>
              <ThemedText size="xs" tertiary>
                Toucher pour réviser
              </ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Historique des parties
      </ThemedText>
      {entries.length === 0 ? (
        <ThemedText tertiary>Aucune partie jouée pour l'instant.</ThemedText>
      ) : (
        entries.map(entry => (
          <TouchableOpacity
            key={entry.id}
            style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.cardBorder}]}
            onPress={() => ouvrirPartie(entry)}>
            <ThemedText semibold size="sm">
              {entry.nom_partie}
            </ThemedText>
            <ThemedText size="xs" tertiary>
              {formatDate(entry.date_partie)} · {entry.mode.toUpperCase()}
            </ThemedText>
            <ThemedText success semibold>
              <Icon name="trophy" size={16} color="#16a34a" /> {entry.equipe_gagnante}
            </ThemedText>
            <ThemedText size="xs" tertiary>
              Questionnaire : {entry.nom_questionnaire}
            </ThemedText>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  section: {
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
});
