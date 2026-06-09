import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

class VoiceService {
  private recognizing = false;
  private result = '';

  async initialize() {
    try {
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);

      Tts.setDefaultRate(0.7);
      Tts.setDefaultPitch(1);

      const voices = await Tts.voices();
      const frenchVoice = voices.find((v: any) => v.language?.includes('fr'));
      if (frenchVoice) {
        await Tts.setDefaultLanguage(frenchVoice.id);
      }
    } catch (error) {
      console.error('Error initializing voice service:', error);
    }
  }

  onSpeechStart() {
    this.recognizing = true;
    this.result = '';
  }

  onSpeechEnd() {
    this.recognizing = false;
  }

  onSpeechResults(e: any) {
    this.result = e.value?.[0] || '';
  }

  onSpeechError(e: any) {
    console.error('Speech error:', e);
  }

  async startListening(): Promise<string> {
    try {
      if (this.recognizing) {
        return '';
      }

      await Voice.start('fr-FR');

      return new Promise((resolve) => {
        setTimeout(() => {
          this.stopListening().then(() => {
            resolve(this.result);
          });
        }, 5000);
      });
    } catch (error) {
      console.error('Error starting listening:', error);
      return '';
    }
  }

  async stopListening(): Promise<string> {
    try {
      await Voice.stop();
      return this.result;
    } catch (error) {
      console.error('Error stopping listening:', error);
      return '';
    }
  }

  async speak(text: string) {
    try {
      await Tts.speak(text);
    } catch (error) {
      console.error('Error speaking:', error);
    }
  }

  async destroy() {
    try {
      await Voice.destroy();
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }

  matchVoiceToChoice(voiceInput: string, choices: string[]): string | null {
    if (!voiceInput) return null;

    const cleanInput = voiceInput.toLowerCase().trim();

    // Try exact match
    const exactMatch = choices.find(
      (c) => c.toLowerCase() === cleanInput
    );
    if (exactMatch) return exactMatch;

    // Try mapping "A", "B", "C", "D" to choices
    const choiceMap: Record<string, number> = {
      'a': 0,
      'b': 1,
      'c': 2,
      'd': 3,
      'première': 0,
      'deuxième': 1,
      'troisième': 2,
      'quatrième': 3,
      'first': 0,
      'second': 1,
      'third': 2,
      'fourth': 3,
    };

    if (choiceMap.hasOwnProperty(cleanInput)) {
      const index = choiceMap[cleanInput];
      return choices[index] || null;
    }

    // Try partial match
    const partialMatch = choices.find((c) =>
      c.toLowerCase().includes(cleanInput) ||
      cleanInput.includes(c.toLowerCase().substring(0, 3))
    );

    return partialMatch || null;
  }
}

export default new VoiceService();
