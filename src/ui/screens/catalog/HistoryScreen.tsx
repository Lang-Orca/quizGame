import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {HistoriqueRepository} from '@/data/sqlite/HistoriqueRepository';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import type {QuestionHostView} from '@/data/sqlite/QuestionnaireRepository';
import type {QuestionnaireMeta} from '@/types/repository';
import type {HistoriqueEntry} from '@/types/repository';

const historiqueRepo = new HistoriqueRepository();
const questionnaireRepo = new QuestionnaireRepository();

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('fr-FR');
}

export function HistoryScreen() {
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
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{reviewTitre}</Text>
        {reviewQuestions.map((q, i) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.question}>
              {i + 1}. {q.texte_question}
            </Text>
            {q.options.map((opt, idx) => {
              const correcte = opt === q.reponse_correcte;
              return (
                <Text
                  key={idx}
                  style={[styles.option, correcte && styles.correct]}>
                  {lettres[idx]}. {opt}
                  {correcte ? '  ✓' : ''}
                </Text>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  }

  if (selectedPartie) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={retour}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedPartie.nom_partie}</Text>
        <Text style={styles.meta}>
          Gagnant : {selectedPartie.equipe_gagnante} ·{' '}
          {formatDate(selectedPartie.date_partie)}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.section}>Questionnaires révisables</Text>
        {questionnaires.length === 0 ? (
          <Text style={styles.empty}>
            Aucun questionnaire terminé pour cette partie.
          </Text>
        ) : (
          questionnaires.map(meta => (
            <TouchableOpacity
              key={meta.id}
              style={styles.card}
              onPress={() => reviser(meta)}>
              <Text style={styles.question}>{meta.titre}</Text>
              <Text style={styles.meta}>Toucher pour réviser</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historique des parties</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>Aucune partie jouée pour l'instant.</Text>
      ) : (
        entries.map(entry => (
          <TouchableOpacity
            key={entry.id}
            style={styles.card}
            onPress={() => ouvrirPartie(entry)}>
            <Text style={styles.question}>{entry.nom_partie}</Text>
            <Text style={styles.meta}>
              {formatDate(entry.date_partie)} · {entry.mode.toUpperCase()}
            </Text>
            <Text style={styles.winner}>🏆 {entry.equipe_gagnante}</Text>
            <Text style={styles.meta}>Questionnaire : {entry.nom_questionnaire}</Text>
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
  back: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
  },
  winner: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  option: {
    fontSize: 14,
    color: '#475569',
  },
  correct: {
    color: '#16a34a',
    fontWeight: '700',
  },
  empty: {
    fontStyle: 'italic',
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
  },
});
