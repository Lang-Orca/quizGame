import {Platform} from 'react-native';

let HapticFeedback: any = null;

try {
  HapticFeedback = require('react-native-haptic-feedback').default;
} catch {}

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function impactLight() {
  if (!HapticFeedback) return;
  if (Platform.OS === 'ios') {
    HapticFeedback.trigger('impactLight', options);
  } else {
    HapticFeedback.trigger('effectClick', options);
  }
}

export function impactMedium() {
  if (!HapticFeedback) return;
  if (Platform.OS === 'ios') {
    HapticFeedback.trigger('impactMedium', options);
  } else {
    HapticFeedback.trigger('effectHeavyClick', options);
  }
}

export function impactHeavy() {
  if (!HapticFeedback) return;
  if (Platform.OS === 'ios') {
    HapticFeedback.trigger('impactHeavy', options);
  } else {
    HapticFeedback.trigger('effectDoubleClick', options);
  }
}

export function selection() {
  if (!HapticFeedback) return;
  HapticFeedback.trigger('selection', options);
}

export function notificationSuccess() {
  if (!HapticFeedback) return;
  if (Platform.OS === 'ios') {
    HapticFeedback.trigger('notificationSuccess', options);
  } else {
    HapticFeedback.trigger('effectClick', options);
  }
}

export function notificationError() {
  if (!HapticFeedback) return;
  if (Platform.OS === 'ios') {
    HapticFeedback.trigger('notificationError', options);
  } else {
    HapticFeedback.trigger('effectHeavyClick', options);
  }
}
