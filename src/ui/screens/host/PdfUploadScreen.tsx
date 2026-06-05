import React, {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {PdfExtractor} from '@/services/PdfExtractor';
import {QuestionGenerator} from '@/services/QuestionGenerator';

type Etape = 'idle' | 'extraction' | 'apercu' | 'generation' | 'fini';

const extractor = new PdfExtractor();
const generator = new QuestionGenerator();

export function PdfUploadScreen() {
  const [etape, setEtape] = useState<Etape>('idle');
  const [titre, setTitre] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [texte, setTexte] = useState('');
  const [nomFichier, setNomFichier] = useState('');
  const [nbQuestions, setNbQuestions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const choisirPdf = async () => {
    setError(null);
    setEtape('extraction');
    try {
      const selection = await extractor.pickPdf();
      if (!selection) {
        setEtape('idle');
        return;
      }
      setNomFichier(selection.name);
      if (!titre) {
        setTitre(selection.name.replace(/\.pdf$/i, ''));
      }
      const extrait = await extractor.extractText(selection.uri);
      setTexte(extrait);
      setEtape('apercu');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extraction impossible.');
      setEtape('idle');
    }
  };

  const generer = async () => {
    setError(null);
    setEtape('generation');
    try {
      const result = await generator.generateFromText(texte, {
        titre: titre.trim() || 'Questionnaire IA',
        isPublic,
      });
      setNbQuestions(result.nbQuestions);
      setEtape('fini');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Génération impossible.');
      setEtape('apercu');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Générer un questionnaire depuis un PDF</Text>
      <Text style={styles.help}>
        Le PDF est lu localement : seul le texte extrait est envoyé à l'IA, le
        fichier n'est jamais uploadé.
      </Text>

      <Text style={styles.label}>Titre du questionnaire</Text>
      <TextInput
        style={styles.input}
        value={titre}
        onChangeText={setTitre}
        placeholder="Ex : Chapitre 3 — Réseaux"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Rendre public (catalogue partagé)</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <Button
        title={etape === 'extraction' ? 'Lecture…' : 'Choisir un PDF'}
        onPress={choisirPdf}
        disabled={etape === 'extraction' || etape === 'generation'}
      />

      {etape === 'extraction' || etape === 'generation' ? (
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>
            {etape === 'extraction'
              ? 'Extraction du texte…'
              : 'Génération des questions…'}
          </Text>
        </View>
      ) : null}

      {etape === 'apercu' || etape === 'fini' ? (
        <View style={styles.card}>
          <Text style={styles.section}>Aperçu du texte — {nomFichier}</Text>
          <Text numberOfLines={8} style={styles.preview}>
            {texte}
          </Text>
        </View>
      ) : null}

      {etape === 'apercu' ? (
        <Button title="Générer les questions" onPress={generer} />
      ) : null}

      {etape === 'fini' ? (
        <Text style={styles.success}>
          {nbQuestions} questions générées et enregistrées.
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  help: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#64748b',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
  },
  preview: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  success: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
  },
  error: {
    fontSize: 14,
    color: '#dc2626',
  },
});
