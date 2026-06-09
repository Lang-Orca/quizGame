import React, {useEffect, useState} from 'react';
import {Button, StyleSheet} from 'react-native';

import {PublicCatalogRepository} from '@/data/sqlite/PublicCatalogRepository';
import type {CachedPublicQuestionnaire} from '@/types/catalog';
import {useHostGame} from '@/ui/host/HostGameContext';
import {ThemedCard} from '@/ui/components/ThemedCard';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';

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
    <ThemedCard>
      <ThemedText bold size="base">
        Questionnaires par round
      </ThemedText>
      {coverage.map(({roundIndex, needed, available}) => {
        const missing = needed - available;
        return (
          <ThemedView key={roundIndex} style={styles.row}>
            <ThemedText size="sm" secondary>
              {roundLabel(roundIndex, totalRounds)}
            </ThemedText>
            <ThemedText
              size="sm"
              semibold
              success={!missing}
              error={missing > 0}>
              {available} / {needed}
              {missing > 0 ? ` (${missing} manquant${missing > 1 ? 's' : ''})` : ''}
            </ThemedText>
          </ThemedView>
        );
      })}

      {totalMissing > 0 ? (
        <>
          <ThemedText size="xs" warning>
            En mode LAN offline, chaque duel doit disposer d'un questionnaire
            public pré-caché.
          </ThemedText>
          <Button
            title="Préparer les questionnaires publics manquants"
            onPress={prepareAllMissing}
          />
        </>
      ) : (
        <ThemedText size="xs" success>
          Tous les rounds sont couverts.
        </ThemedText>
      )}

      {cached.length > 0 ? (
        <ThemedView style={styles.publicsBlock}>
          <ThemedText bold size="base">
            Questionnaires publics téléchargés
          </ThemedText>
          {cached.map(item => (
            <ThemedView key={item.firebaseId} style={styles.publicRow}>
              <ThemedView style={styles.publicInfo}>
                <ThemedText size="sm" semibold>
                  {item.titre}
                </ThemedText>
                <ThemedText size="xs" tertiary>
                  {item.nb_questions} questions
                  {item.auteur ? ` · ${item.auteur}` : ''}
                </ThemedText>
              </ThemedView>
              <Button
                title="Prochain duel"
                onPress={() => assignQuestionnaireToNext(item.localId)}
              />
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
