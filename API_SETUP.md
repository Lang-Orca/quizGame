# 🔑 API Configuration Guide

## Anthropic Claude API (Required for AI Mode)

### 1. Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in with your account
3. Navigate to the **API Keys** section
4. Click **Create Key**
5. Copy the generated key (starts with `sk-ant-`)

### 2. Configure the API Key

#### Option A: Direct Configuration (Development)

Edit `src/services/anthropicService.ts`:

```typescript
const ANTHROPIC_API_KEY = 'sk-ant-YOUR_KEY_HERE';
```

#### Option B: Environment Variables (Recommended for Production)

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit `.env` and add your key:

```
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

3. Update `src/services/anthropicService.ts`:

```typescript
import { ANTHROPIC_API_KEY } from '@react-native-dotenv';

const API_KEY = ANTHROPIC_API_KEY || 'your_anthropic_api_key_here';
```

### 3. Install dotenv Package (for environment variables)

```bash
npm install react-native-dotenv
```

Update `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@react-native-dotenv',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true,
      verbose: false,
    }],
  ],
};
```

### 4. Test Your Configuration

Run the app and try the AI mode:
1. Go to Home Screen
2. Select "🤖 IA" mode
3. Enter a theme (e.g., "Dinosaurs")
4. Click "✨ Générer"

If you see questions generated, your API key is working!

## Open Trivia Database API (Online Mode - Free)

The online mode uses [Open Trivia Database](https://opentdb.com) which is **free and doesn't require authentication**.

### API Endpoint

```
https://opentdb.com/api.php?amount=10&type=multiple
```

### Features

- ✅ Free - No API key needed
- ✅ Reliable - Questions are constantly updated
- ✅ Diverse - Multiple categories available
- ✅ No rate limiting for reasonable use

## Troubleshooting

### "No matching version found" error

If you get `npm error: notarget`, try updating package versions:

```bash
npm update
npm install
```

### API Key Not Working

1. **Verify the key format**: Should start with `sk-ant-`
2. **Check API quota**: Ensure your account has available credits
3. **Test with curl**:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-opus", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}'
```

### Voice Recognition Not Working

1. Check microphone permissions in Android/iOS settings
2. Ensure French language pack is installed
3. Test with simpler voice commands first

### Text-to-Speech Issues

1. Verify device has audio enabled
2. Check system language settings
3. Update TTS engine in device settings

## API Usage Costs

### Anthropic Claude
- **Input tokens**: $0.003 per 1K tokens (Claude 3.5 Sonnet)
- **Output tokens**: $0.015 per 1K tokens
- **Estimate**: ~0.05-0.10¢ per generated quiz (10 questions)

### OpenTDB
- **Completely free**
- **No quotas** (for personal use)

## Security Best Practices

1. **Never commit API keys to GitHub**
2. **Use `.env` files** (add to `.gitignore`)
3. **Rotate keys regularly** in console
4. **Monitor usage** in Anthropic dashboard
5. **Set billing alerts** to avoid surprises

## Regional Availability

- ✅ Claude API is available globally
- ✅ OpenTDB works worldwide
- ⚠️ Voice features may vary by device/region

## Support & Links

- [Anthropic Console](https://console.anthropic.com)
- [Claude API Docs](https://docs.anthropic.com)
- [Open Trivia Database](https://opentdb.com)
- [React Native Voice Docs](https://github.com/react-native-voice/voice)
- [React Native TTS Docs](https://github.com/ak1394/react-native-tts)

---

**Need help?** Check the main SETUP_GUIDE.md for more information.
