module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@ragempcommunity/types-server)/)'
  ],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  // decorators
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
};