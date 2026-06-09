# ✨ Features & Usage Guide

## 🏠 Home Screen

### Mode Selection

1. **📱 Offline** - Play with pre-loaded questions (no internet needed)
2. **🌐 Online** - Fetch questions from Open Trivia Database
3. **🤖 IA** - Generate custom questions with AI

### Category Selection

Available for Offline and Online modes:
- **Culture générale** - General knowledge
- **Science** - Natural sciences, physics, chemistry, biology
- **Sport** - Sports history, rules, famous athletes
- **Histoire** - Historical events and figures

### Voice Mode Toggle

Enable/disable voice recognition and text-to-speech:
- 🎤 **Voice Recognition** - Speak your answers
- 🔊 **Text-to-Speech** - Questions read aloud

**Supported voice inputs:**
- Single letters: "A", "B", "C", "D"
- French ordinals: "première", "deuxième", "troisième", "quatrième"
- Answer text: "Paris" will match choice containing "Paris"

## 🎯 Quiz Screen

### Quiz Interface

```
┌─────────────────────────────────┐
│  Question 1/10          Score: 0 │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░ │ 
│                         ⏱️ 15s   │
├─────────────────────────────────┤
│ What is the capital of France?  │
├─────────────────────────────────┤
│ [A] Paris                       │
│ [B] Lyon                        │
│ [C] Marseille                   │
│ [D] Toulouse                    │
└─────────────────────────────────┘
```

### Features

#### Timer
- **15 seconds** per question
- Displays in red when < 5 seconds
- Auto-advances to next question when time runs out

#### Progress Bar
- Visual representation of quiz progress
- Updates with each question

#### Score Counter
- Real-time score tracking
- Shows correct answers count

#### Answer Feedback
- ✅ **Green highlight** for correct answers
- ❌ **Red highlight** for wrong answers
- Shows correct answer even if you answered wrong

#### Voice Mode Indicator
- Shows when listening is active: "🎤 En écoute..."
- Indicator when voice mode enabled: "🎤 Mode vocal activé"

### Voice Input Examples

```
Question: "Which planet is largest?"
Choices: ["Jupiter", "Saturn", "Neptune", "Uranus"]

Valid voice inputs:
- "A" or "première" → Jupiter
- "B" or "deuxième" → Saturn
- "Jupiter" → Jupiter (exact match)
- "Jup" → Jupiter (partial match)
```

## 🤖 AI Generator Screen

### How to Use

1. **Enter or Speak a Theme**
   - Type theme in text field
   - Or click 🎤 to dictate

2. **Generate Questions**
   - Click ✨ to generate
   - AI creates 10 unique questions in 2-5 seconds

3. **Take the Quiz**
   - Automatically starts with generated questions
   - Same as normal quiz flow

### Example Themes

- "Les dinosaures" (Dinosaurs)
- "La cuisine italienne" (Italian cuisine)
- "L'histoire de l'Égypte ancienne" (Ancient Egypt)
- "Les technologies modernes" (Modern technologies)
- "La musique classique" (Classical music)

### Generated Question Format

```json
[
  {
    "question": "Question text in French",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]
```

## 📊 Result Screen

### Performance Ratings

| Score    | Rating        | Emoji |
|----------|---------------|-------|
| 80-100%  | Excellent     | 🌟   |
| 60-79%   | Bien (Good)   | 👍   |
| < 60%    | À améliorer   | 📚   |

### Statistics Displayed

- **Final Score**: X/10
- **Performance Rating**: Based on percentage
- **Category**: Quiz category or theme
- **Correct Answers**: Count in green
- **Incorrect Answers**: Count in red

### Actions

- 🔄 **Rejouer** - Take another quiz (returns to Home)
- 🏠 **Accueil** - Return to Home screen

## 🎨 Design Features

### Color Scheme

- **Dark Background** (#1a1a2e) - Easy on eyes
- **Accent Purple** (#7c3aed) - Interactive elements
- **Card Background** (#16213e) - Content containers
- **Success Green** (#10b981) - Correct answers
- **Error Red** (#ef4444) - Wrong answers

### Animations

- ✨ Scale up animation on correct answer
- ⚡ Scale down animation on wrong answer
- 🎯 Smooth transitions between screens
- 🎪 Animated progress bar updates

### Accessibility

- Large text sizes for readability
- High contrast colors
- Touch-friendly button sizes
- Voice support for accessibility

## 📱 Offline Mode Details

### Available Questions by Category

**Culture générale (10+ questions)**
- Geography, history, arts, literature

**Science (10+ questions)**
- Chemistry, physics, biology, space

**Sport (10+ questions)**
- Sports history, famous athletes, rules

**Histoire (10+ questions)**
- Historical events, civilizations, figures

### Storage

Questions stored locally in `src/data/questions.ts`:
- Works 100% offline after first load
- No internet required
- Instant quiz start

## 🌐 Online Mode Details

### Data Source

- **API**: Open Trivia Database
- **Endpoint**: opentdb.com/api.php
- **Rate**: Unlimited for personal use
- **Freshness**: Questions constantly updated

### Connection Requirements

- Requires internet connection
- Auto-fails gracefully if offline
- Shows error message if API unreachable

## 🎤 Voice Features

### Speech Recognition

- **Language**: French (fr-FR)
- **Timeout**: 5 seconds
- **Accuracy**: Depends on device microphone
- **Privacy**: Processed locally

### Text-to-Speech

- **Language**: French
- **Speed**: 0.7x (slower for clarity)
- **Pitch**: 1.0 (normal)
- **Voice**: Device default French voice

### Troubleshooting Voice

**Microphone not detected:**
- Check app permissions in settings
- Restart app
- Test system microphone

**Speech not recognized:**
- Speak clearly and at normal pace
- Try shorter words
- Ensure microphone is not muted

**Audio output not working:**
- Check device volume
- Ensure audio is not muted
- Check system sound settings

## 💡 Pro Tips

1. **Voice Mode Tips**
   - Use single letters "A", "B", etc. for faster recognition
   - Speak clearly and naturally
   - You have 5 seconds to respond

2. **Offline Mode**
   - Best for testing on airplane mode
   - No network delays
   - Perfect for battery saving

3. **AI Mode**
   - Use specific themes for better questions
   - Examples work better: "la Renaissance" vs "histoire"
   - Generate multiple quizzes on same theme

4. **Time Management**
   - 15 seconds per question is tight!
   - With voice mode: listen while reading
   - Quick thinking = higher scores

5. **Performance**
   - Offline > Online (no network latency)
   - Voice recognition takes 2-3 seconds
   - Pre-load app for smooth operation

## ⚙️ Configuration

Edit settings in screen files:

```typescript
// Timer duration (QuizScreen.tsx)
const TIMER_SECONDS = 15;

// Questions per quiz
const QUESTIONS_COUNT = 10;

// Voice timeout (voiceService.ts)
const VOICE_TIMEOUT = 5000;

// AI model (anthropicService.ts)
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Colors (all screens)
const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
```

## 🔗 External Resources

- [Anthropic Claude](https://www.anthropic.com)
- [Open Trivia Database](https://opentdb.com)
- [React Native Voice](https://github.com/react-native-voice/voice)
- [React Native TTS](https://github.com/ak1394/react-native-tts)
- [React Navigation](https://reactnavigation.org)

---

**Happy Quizzing! 🎓**
