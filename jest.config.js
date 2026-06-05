module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': '<rootDir>/__mocks__/uuid.ts',
    '^react-native-quick-sqlite$':
      '<rootDir>/__mocks__/react-native-quick-sqlite.ts',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
