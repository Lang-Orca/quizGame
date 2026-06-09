import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {PublicCatalogRepository} from '@/data/sqlite/PublicCatalogRepository';
import {PublicCatalogService} from '@/services/PublicCatalogService';
import type {PublicQuestionnaireSummary} from '@/types/catalog';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useColors, borderRadius} from '@/ui/theme';

const service = new PublicCatalogService();
const cacheRepo = new PublicCatalogRepository();

export function PublicListScreen() {
  const colors = useColors();
  const [items, setItems] = useState<PublicQuestionnaireSummary[]>([]);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const rafraichir = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await service.fetchPublicList();
      setItems(list);
      setDownloaded(
        new Set(cacheRepo.getAllCached().map(c => c.firebaseId)),
      );
    } catch {
      setError('Impossible de charger le catalogue. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    rafraichir();
  }, [rafraichir]);

  const telecharger = async (item: PublicQuestionnaireSummary) => {
    setDownloadingId(item.firebaseId);
    setError(null);
    try {
      await service.downloadQuestionnaire(item.firebaseId);
      setDownloaded(prev => new Set(prev).add(item.firebaseId));
    } catch {
      setError('Téléchargement impossible.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter(
      i =>
        i.titre.toLowerCase().includes(q) ||
        (i.auteur ?? '').toLowerCase().includes(q),
    );
  }, [items, recherche]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText size="xxl" bold>
        Catalogue public
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.card},
        ]}
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher un questionnaire…"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      {error ? <ThemedText error>{error}</ThemedText> : null}

      <FlatList
        data={filtres}
        keyExtractor={item => item.firebaseId}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={rafraichir} />
        }
        ListEmptyComponent={
          loading ? null : (
            <ThemedText tertiary center style={styles.empty}>
              Aucun questionnaire public.
            </ThemedText>
          )
        }
        contentContainerStyle={styles.list}
        renderItem={({item}) => {
          const estTelecharge = downloaded.has(item.firebaseId);
          const enCours = downloadingId === item.firebaseId;
          return (
            <ThemedView
              style={[
                styles.card,
                {backgroundColor: colors.surface, borderColor: colors.cardBorder},
              ]}>
              <ThemedView style={styles.info}>
                <ThemedText size="sm" semibold>
                  {item.titre}
                </ThemedText>
                <ThemedText size="xs" tertiary>
                  {item.nb_questions} questions
                  {item.auteur ? ` · ${item.auteur}` : ''}
                </ThemedText>
              </ThemedView>
              {estTelecharge ? (
                <ThemedText success semibold>
                  Téléchargé
                </ThemedText>
              ) : (
                <TouchableOpacity
                  style={[styles.button, {backgroundColor: colors.primary}]}
                  disabled={enCours}
                  onPress={() => telecharger(item)}>
                  {enCours ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <ThemedText inverse semibold size="sm">
                      Télécharger
                    </ThemedText>
                  )}
                </TouchableOpacity>
              )}
            </ThemedView>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  empty: {
    marginTop: 24,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  button: {
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
