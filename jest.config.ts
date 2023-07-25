import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  testPathIgnorePatterns: ['/helpers.ts']
}

export default jestConfig
