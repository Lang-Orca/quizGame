# 🎯 Quiz Master - React Native Quiz App

A complete React Native quiz application with online, offline, and AI-powered modes.

## 📋 Features

- **Online Mode**: Fetch questions from Open Trivia Database
- **Offline Mode**: Play with pre-loaded questions in 4 categories
- **AI Mode**: Generate custom questions using Claude AI
- **Voice Recognition**: Speak your answers (French support)
- **Text-to-Speech**: Questions read aloud automatically
- **Dark Theme**: Modern dark UI with purple accents
- **Progress Tracking**: Visual progress bar and timer
- **Score Analytics**: Detailed results with performance metrics

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/hp/quizGame
npm install
```

### 2. Configure API (For AI Mode)

Edit `src/services/anthropicService.ts` and replace:
```typescript
const ANTHROPIC_API_KEY = 'your_anthropic_api_key_here';
```

Get your API key from [Anthropic Console](https://console.anthropic.com)

### 3. Run on Android

```bash
npm run android
```

Or iOS:
```bash
npm run ios
```

### 4. Start Metro Bundler

```bash
npm start
```

## 📱 App Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx          # Mode & category selection
│   ├── QuizScreen.tsx          # Main quiz interface
│   ├── AIGeneratorScreen.tsx   # AI question generation
│   └── ResultScreen.tsx        # Score & results
├── navigation/
│   └── AppNavigator.tsx        # React Navigation setup
├── services/
│   ├── voiceService.ts         # Speech & TTS handling
│   └── anthropicService.ts     # Claude API integration
├── data/
│   └── questions.ts            # Offline questions database
└── types/
    └── index.ts                # TypeScript interfaces
```

## 🎮 App Modes

### 📱 Offline Mode
- 40+ pre-loaded questions in 4 categories
- Works without internet
- Instant quiz start

**Categories:**
- Culture générale (General Culture)
- Science
- Sport
- Histoire (History)

### 🌐 Online Mode
- Fetches questions from OpenTDB API
- Real-time questions
- Always fresh content

### 🤖 AI Mode
- Type or speak a theme
- Claude generates 10 unique questions
- Dynamic content creation

## 🎤 Voice Features

### Speech Recognition
- Answer by speaking: "A", "B", "Paris", "première"
- French language support
- 5-second timeout per answer

### Text-to-Speech
- Questions read automatically in voice mode
- Accented French voice
- Adjustable speed and pitch

## 🎨 Design System

- **Dark Background**: `#1a1a2e`
- **Accent Purple**: `#7c3aed`
- **Card Background**: `#16213e`
- **Text Color**: `#e0e0e0`
- **Success Green**: `#10b981`
- **Error Red**: `#ef4444`

## 📊 Quiz Features

- **10 Questions** per quiz
- **15-Second Timer** per question
- **Multiple Choice** with 4 options
- **Instant Feedback** (Green = Correct, Red = Wrong)
- **Auto-Progression** after each answer
- **Final Score** with performance rating

## 🔧 Troubleshooting

### Voice Recognition Not Working
- Check microphone permissions
- Ensure French language pack is installed
- Try restarting the app

### AI Questions Not Generating
- Verify API key is correct
- Check internet connection
- Ensure Claude API has available credits

### App Crashes on Startup
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Gradle cache: `./android/gradlew clean`
- Reset Metro cache: `npm start -- --reset-cache`

## 🛠️ Technologies

- **React Native** 0.85.3
- **React Navigation** 6.x
- **@react-native-voice** - Speech recognition
- **react-native-tts** - Text-to-speech
- **@react-native-async-storage** - Local storage
- **Anthropic Claude API** - AI question generation
- **OpenTDB API** - Online trivia database

## 📝 Development

### Adding New Offline Questions

Edit `src/data/questions.ts`:

```typescript
'Nouvelle Catégorie': [
  {
    question: 'Your question?',
    choices: ['A', 'B', 'C', 'D'],
    answer: 'A',
  },
  // ... more questions
]
```

### Customizing Theme

Edit color constants in screen files:

```typescript
const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

For issues or feature requests, please check the troubleshooting section or refer to the individual service documentation.

---

**Made with ❤️ using React Native**
