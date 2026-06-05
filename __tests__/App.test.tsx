/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@/data/sqlite/database', () => ({
  initDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/data/mmkv/storage', () => ({
  storage: {
    pingInit: jest.fn(),
  },
}));

jest.mock('@/ui/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
