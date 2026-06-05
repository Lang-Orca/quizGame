import DocumentPicker, {types} from 'react-native-document-picker';

export interface PdfSelection {
  uri: string;
  name: string;
}

export class PdfNonSupporteError extends Error {
  constructor() {
    super('PDF non supporté, utilisez un PDF texte (non scanné).');
    this.name = 'PdfNonSupporteError';
  }
}

export class PdfExtractorIndisponibleError extends Error {
  constructor() {
    super(
      "L'extraction PDF native n'est pas configurée. Installez une librairie " +
        "d'extraction (ex : expo-pdf-text-extract) puis enregistrez-la via " +
        'setPdfTextExtractor().',
    );
    this.name = 'PdfExtractorIndisponibleError';
  }
}

/**
 * Fonction d'extraction de texte native, injectée au démarrage de l'app pour
 * éviter tout couplage de build avec une librairie PDF spécifique (le bundler
 * ne doit pas exiger la dépendance si elle n'est pas installée).
 */
export type PdfTextExtractor = (uri: string) => Promise<string>;

let registeredExtractor: PdfTextExtractor | null = null;

export function setPdfTextExtractor(extractor: PdfTextExtractor | null): void {
  registeredExtractor = extractor;
}

/**
 * Sélection locale d'un PDF et extraction de son texte. Le fichier n'est
 * jamais uploadé : seule la chaîne de texte extraite est envoyée à l'IA.
 */
export class PdfExtractor {
  constructor(private readonly extractor?: PdfTextExtractor) {}

  async pickPdf(): Promise<PdfSelection | null> {
    const results = await DocumentPicker.pick({
      type: [types.pdf],
      allowMultiSelection: false,
    });
    const file = results[0];
    if (!file) {
      return null;
    }
    return {uri: file.uri, name: file.name ?? 'document.pdf'};
  }

  async extractText(uri: string): Promise<string> {
    const fn = this.extractor ?? registeredExtractor;
    if (!fn) {
      throw new PdfExtractorIndisponibleError();
    }
    const text = await fn(uri);
    if (!text || text.trim().length === 0) {
      throw new PdfNonSupporteError();
    }
    return text;
  }
}
