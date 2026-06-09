import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {PublicCatalogRepository} from '@/data/sqlite/PublicCatalogRepository';
import {PublicCatalogService} from '@/services/PublicCatalogService';
import type {PublicQuestionnaireSummary} from '@/types/catalog';

const service = new PublicCatalogService();
const cacheRepo = new PublicCatalogRepository();

export function PublicListScreen() {
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
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue public</Text>
      <TextInput
        style={styles.input}
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher un questionnaire…"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={filtres}
        keyExtractor={item => item.firebaseId}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={rafraichir} />
        }
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>Aucun questionnaire public.</Text>
          )
        }
        renderItem={({item}) => {
          const estTelecharge = downloaded.has(item.firebaseId);
          const enCours = downloadingId === item.firebaseId;
          return (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.cardTitle}>{item.titre}</Text>
                <Text style={styles.meta}>
                  {item.nb_questions} questions
                  {item.auteur ? ` · ${item.auteur}` : ''}
                </Text>
              </View>
              {estTelecharge ? (
                <Text style={styles.done}>Téléchargé</Text>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  disabled={enCours}
                  onPress={() => telecharger(item)}>
                  {enCours ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Télécharger</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  error: {
    color: '#dc2626',
  },
  empty: {
    fontStyle: 'italic',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  done: {
    color: '#16a34a',
    fontWeight: '600',
  },
});
