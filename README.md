This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).
# 🎯 Quiz Master - React Native Quiz App

A complete, production-ready React Native quiz application with **online**, **offline**, and **AI-powered** modes featuring voice recognition and text-to-speech capabilities.

## ✨ Features at a Glance

- 📱 **Offline Mode** - 40+ pre-loaded questions in 4 categories
- 🌐 **Online Mode** - Questions from OpenTDB API
- 🤖 **AI Mode** - Generate questions using Claude AI
- 🎤 **Voice Recognition** - Speak your answers in French
- 🔊 **Text-to-Speech** - Questions read aloud automatically
- ⏱️ **Smart Timer** - 15-second countdown per question
- 📊 **Live Scoring** - Real-time score tracking
- 🎨 **Beautiful UI** - Dark theme with purple accents & animations
- 🧠 **AI Integration** - Powered by Claude Sonnet 4

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have:
- Node.js 22.11.0+ 
- npm or yarn
- Android Studio (for Android)
- Xcode (for iOS)

### 2. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 3. Configure Claude API (For AI Mode)

1. Get your API key: https://console.anthropic.com
2. Edit `src/services/anthropicService.ts`:
   ```typescript
   const ANTHROPIC_API_KEY = 'sk-ant-YOUR_KEY_HERE';
   ```
3. See [API_SETUP.md](API_SETUP.md) for detailed instructions

## 📱 App Modes

### 📱 Offline Mode
- **Categories**: Culture générale, Science, Sport, Histoire
- **Questions**: 40+ total (10+ per category)
- **Connection**: Not required
- **Speed**: Instant

### 🌐 Online Mode
- **Source**: Open Trivia Database
- **Questions**: Fresh, constantly updated
- **Connection**: Required
- **Update**: Real-time

### 🤖 AI Mode
- **Generation**: Claude AI creates custom questions
- **Input**: Any theme (French or English)
- **Questions**: 10 unique questions per quiz
- **Customization**: Theme-based content

## 🎮 How to Play

1. **Select Mode** - Choose Offline, Online, or AI
2. **Pick Category** - Select your quiz topic (Offline/Online only)
3. **Enable Voice** - Toggle 🎤 if you want voice input/output
4. **Start Quiz** - Click 🚀 to begin
5. **Answer Questions** - Choose or speak your answer (A, B, C, or D)
6. **See Results** - Get score, rating, and performance stats

## 🎤 Voice Features

### How to Use Voice

**Speak any of these to answer:**
- Single letters: `"A"`, `"B"`, `"C"`, `"D"`
- French ordinals: `"première"`, `"deuxième"`, `"troisième"`, `"quatrième"`
- Answer text: `"Paris"`, `"Einstein"`, etc.

**Text-to-Speech:**
- Questions automatically read in French
- Adjustable speed and pitch
- Clear pronunciation for better understanding

**Example:**
```
🎤 Question: "Quel est la capitale de la France?"
🎤 Choices: ["Paris", "Lyon", "Marseille", "Toulouse"]
🗣️ Your answer: "A" or "première" or "Paris"
✅ Result: Correct!
```

## 📊 Quiz Structure

- **Questions**: 10 per quiz
- **Time**: 15 seconds per question
- **Options**: Multiple choice (4 choices)
- **Feedback**: Instant color-coded results
- **Progress**: Visual progress bar

## 🏆 Scoring System

| Score    | Rating        | Message |
|----------|---------------|---------|
| 80-100%  | 🌟 Excellent  | Vous êtes un expert! |
| 60-79%   | 👍 Bien       | Bon travail! |
| < 60%    | 📚 À améliorer | Réessayez! |

## 📁 Project Structure

```
quizGame/
├── src/
│   ├── screens/              # 4 main screens
│   │   ├── HomeScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── AIGeneratorScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── navigation/           # React Navigation
│   │   └── AppNavigator.tsx
│   ├── services/             # API & voice services
│   │   ├── anthropicService.ts
│   │   └── voiceService.ts
│   ├── data/                 # Offline questions
│   │   └── questions.ts
│   └── types/                # TypeScript interfaces
│       └── index.ts
├── App.tsx                   # Main app component
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── SETUP_GUIDE.md            # Setup instructions
├── API_SETUP.md              # API configuration
├── FEATURES.md               # Feature guide
└── PROJECT_SUMMARY.md        # Implementation details
```

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Installation & troubleshooting
- **[API_SETUP.md](API_SETUP.md)** - Claude & OpenDB API setup
- **[FEATURES.md](FEATURES.md)** - Detailed feature guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Implementation overview

## 🛠️ Technology Stack

### Core
- React Native 0.85.3
- React 19.2.3
- TypeScript 5.8.3

### Navigation
- @react-navigation/native 6.1.17
- @react-navigation/native-stack 6.9.26

### Voice Features
- @react-native-voice/voice 3.2.4
- react-native-tts 4.1.0

### Storage
- @react-native-async-storage/async-storage 1.23.1

### UI Components
- react-native-screens 3.29.0
- react-native-safe-area-context 5.5.2

### AI & APIs
- Anthropic Claude API (claude-sonnet-4-20250514)
- Open Trivia Database API

## 🎨 Design System

### Colors
- Dark Background: `#1a1a2e`
- Accent Purple: `#7c3aed`
- Card Background: `#16213e`
- Text: `#e0e0e0`
- Success: `#10b981`
- Error: `#ef4444`

### UI Elements
- Rounded cards with 8px radius
- Smooth animations & transitions
- Touch-friendly button sizes
- Clear visual hierarchy
- High contrast text

## 🔧 Development

### Available Scripts

```bash
# Start development
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

### Modify Questions

Edit `src/data/questions.ts` to add/modify offline questions:

```typescript
'Category': [
  {
    question: 'Your question?',
    choices: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: 'Option A',
  },
]
```

### Customize Theme

Edit color constants in screen files:

```typescript
const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
```

## 🐛 Troubleshooting

### App Won't Start
```bash
npm install
npm start -- --reset-cache
```

### Voice Recognition Issues
- Check microphone permissions
- Ensure French language is available
- Try simpler voice commands

### API Not Working
- Verify API key is correct
- Check internet connection
- See [API_SETUP.md](API_SETUP.md)

### Metro Server Issues
```bash
# Kill all Metro processes
pkill -f "react-native"

# Clear cache and restart
npm start -- --reset-cache
```

For more help, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 📝 API Configuration

### For AI Questions
1. Create account at https://console.anthropic.com
2. Generate API key
3. Add to `src/services/anthropicService.ts`
4. Set billing limit in dashboard

### For Online Questions
- Uses free OpenTDB API
- No authentication required
- Unlimited access for personal use

## 🔒 Security

- Never commit API keys to version control
- Use `.env` files for sensitive data
- Rotate keys regularly
- Monitor API usage

## 📊 Performance

- Offline mode: Instant response
- Online mode: 1-2 second API call
- AI mode: 2-5 seconds for generation
- Voice: 3-5 seconds for recognition

## 🌍 Localization

Currently optimized for **French**:
- UI text in French
- Voice recognition: French (fr-FR)
- TTS: French voice

Can be extended for other languages.

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Areas for expansion:
- Additional languages
- More question categories
- Enhanced animations
- Custom themes
- Leaderboard system
- Question difficulty levels

## 📞 Support

- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for setup issues
- See [API_SETUP.md](API_SETUP.md) for API problems
- Review [FEATURES.md](FEATURES.md) for usage questions

## 🎯 Next Steps

1. **Test locally**: `npm start`
2. **Configure API**: Get Claude key from console.anthropic.com
3. **Try each mode**: Offline, Online, and AI
4. **Test voice**: Enable voice mode and test recognition
5. **Build for production**: See build instructions below

## 📦 Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
# APK: app/build/outputs/apk/release/app-release.apk
```

### iOS
```bash
cd ios
xcodebuild -workspace quizgame.xcworkspace \
  -scheme quizgame \
  -configuration Release
```

---

**Built with ❤️ using React Native, React Navigation, and Claude AI**

**Start quizzing now: `npm start`** 🚀


For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
# quizGame
