import React, {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';

import {PdfExtractor} from '@/services/PdfExtractor';
import {QuestionGenerator} from '@/services/QuestionGenerator';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {ThemedCard} from '@/ui/components/ThemedCard';
import {useColors} from '@/ui/theme';

type Etape = 'idle' | 'extraction' | 'apercu' | 'generation' | 'fini';

const extractor = new PdfExtractor();
const generator = new QuestionGenerator();

export function PdfUploadScreen() {
  const colors = useColors();
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
      <ThemedText size="xl" bold>
        Générer un questionnaire depuis un PDF
      </ThemedText>
      <ThemedText size="sm" tertiary>
        Le PDF est lu localement : seul le texte extrait est envoyé à l'IA, le
        fichier n'est jamais uploadé.
      </ThemedText>

      <ThemedText semibold size="sm" secondary>
        Titre du questionnaire
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.card},
        ]}
        value={titre}
        onChangeText={setTitre}
        placeholder="Ex : Chapitre 3 — Réseaux"
        placeholderTextColor={colors.textMuted}
      />

      <ThemedView style={styles.switchRow}>
        <ThemedText size="sm" semibold secondary>
          Rendre public (catalogue partagé)
        </ThemedText>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </ThemedView>

      <Button
        title={etape === 'extraction' ? 'Lecture…' : 'Choisir un PDF'}
        onPress={choisirPdf}
        disabled={etape === 'extraction' || etape === 'generation'}
      />

      {etape === 'extraction' || etape === 'generation' ? (
        <ThemedView style={styles.loading}>
          <ActivityIndicator />
          <ThemedText tertiary>
            {etape === 'extraction'
              ? 'Extraction du texte…'
              : 'Génération des questions…'}
          </ThemedText>
        </ThemedView>
      ) : null}

      {etape === 'apercu' || etape === 'fini' ? (
        <ThemedCard>
          <ThemedText semibold size="sm">
            Aperçu du texte — {nomFichier}
          </ThemedText>
          <ThemedText size="sm" secondary numberOfLines={8}>
            {texte}
          </ThemedText>
        </ThemedCard>
      ) : null}

      {etape === 'apercu' ? (
        <Button title="Générer les questions" onPress={generer} />
      ) : null}

      {etape === 'fini' ? (
        <ThemedText success semibold>
          {nbQuestions} questions générées et enregistrées.
        </ThemedText>
      ) : null}

      {error ? <ThemedText error>{error}</ThemedText> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  input: {
    borderWidth: 1,
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
});
