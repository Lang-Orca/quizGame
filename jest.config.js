module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': '<rootDir>/__mocks__/uuid.ts',
    '^react-native-quick-sqlite$':
      '<rootDir>/__mocks__/react-native-quick-sqlite.ts',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.ts',
    '^react-native-tcp-socket$':
      '<rootDir>/__mocks__/react-native-tcp-socket.ts',
    '^react-native-zeroconf$': '<rootDir>/__mocks__/react-native-zeroconf.ts',
    '^@react-native-firebase/app$': '<rootDir>/__mocks__/firebaseApp.ts',
    '^@react-native-firebase/database$':
      '<rootDir>/__mocks__/firebaseDatabase.ts',
    '^@react-native-firebase/auth$': '<rootDir>/__mocks__/firebaseAuth.ts',
    '^react-native-keychain$': '<rootDir>/__mocks__/react-native-keychain.ts',
    '^react-native-document-picker$':
      '<rootDir>/__mocks__/react-native-document-picker.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
