import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

import {PublicCatalogRepository} from '@/data/sqlite/PublicCatalogRepository';
import type {CachedPublicQuestionnaire} from '@/types/catalog';
import {useHostGame} from '@/ui/host/HostGameContext';

const catalogRepo = new PublicCatalogRepository();

function roundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) {
    return 'Finale';
  }
  if (fromEnd === 1) {
    return 'Demi-finales';
  }
  if (fromEnd === 2) {
    return 'Quarts';
  }
  return `Round ${roundIndex + 1}`;
}

export function QuestionnaireSelectScreen() {
  const {coverage, prepareAllMissing, assignQuestionnaireToNext} = useHostGame();
  const [cached, setCached] = useState<CachedPublicQuestionnaire[]>([]);
  const totalRounds = coverage.length;
  const totalMissing = coverage.reduce(
    (acc, c) => acc + (c.needed - c.available),
    0,
  );

  useEffect(() => {
    setCached(catalogRepo.getAllCached());
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Questionnaires par round</Text>
      {coverage.map(({roundIndex, needed, available}) => {
        const missing = needed - available;
        return (
          <View key={roundIndex} style={styles.row}>
            <Text style={styles.round}>
              {roundLabel(roundIndex, totalRounds)}
            </Text>
            <Text style={[styles.count, missing > 0 && styles.missing]}>
              {available} / {needed}
              {missing > 0 ? ` (${missing} manquant${missing > 1 ? 's' : ''})` : ''}
            </Text>
          </View>
        );
      })}

      {totalMissing > 0 ? (
        <>
          <Text style={styles.warning}>
            En mode LAN offline, chaque duel doit disposer d'un questionnaire
            public pré-caché.
          </Text>
          <Button
            title="Préparer les questionnaires publics manquants"
            onPress={prepareAllMissing}
          />
        </>
      ) : (
        <Text style={styles.ok}>Tous les rounds sont couverts.</Text>
      )}

      {cached.length > 0 ? (
        <View style={styles.publicsBlock}>
          <Text style={styles.title}>Questionnaires publics téléchargés</Text>
          {cached.map(item => (
            <View key={item.firebaseId} style={styles.publicRow}>
              <View style={styles.publicInfo}>
                <Text style={styles.publicTitre}>{item.titre}</Text>
                <Text style={styles.publicMeta}>
                  {item.nb_questions} questions
                  {item.auteur ? ` · ${item.auteur}` : ''}
                </Text>
              </View>
              <Button
                title="Prochain duel"
                onPress={() => assignQuestionnaireToNext(item.localId)}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  round: {
    fontSize: 14,
    color: '#334155',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  missing: {
    color: '#dc2626',
  },
  warning: {
    fontSize: 13,
    color: '#b45309',
    fontStyle: 'italic',
  },
  ok: {
    fontSize: 13,
    color: '#16a34a',
  },
  publicsBlock: {
    marginTop: 12,
    gap: 8,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  publicInfo: {
    flex: 1,
  },
  publicTitre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  publicMeta: {
    fontSize: 12,
    color: '#64748b',
  },
});
