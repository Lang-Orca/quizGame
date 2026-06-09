import {
  PdfExtractor,
  PdfExtractorIndisponibleError,
  PdfNonSupporteError,
} from '@/services/PdfExtractor';

describe('PdfExtractor', () => {
  it('extrait le texte via l’extracteur injecté', async () => {
    const extractor = new PdfExtractor(async () => 'Contenu du PDF');
    const texte = await extractor.extractText('file:///mock.pdf');
    expect(texte).toBe('Contenu du PDF');
  });

  it('lève PdfNonSupporteError si le texte est vide (PDF scanné)', async () => {
    const extractor = new PdfExtractor(async () => '   ');
    await expect(extractor.extractText('file:///scan.pdf')).rejects.toBeInstanceOf(
      PdfNonSupporteError,
    );
  });

  it('lève PdfExtractorIndisponibleError sans extracteur configuré', async () => {
    const extractor = new PdfExtractor();
    await expect(
      extractor.extractText('file:///mock.pdf'),
    ).rejects.toBeInstanceOf(PdfExtractorIndisponibleError);
  });
});
