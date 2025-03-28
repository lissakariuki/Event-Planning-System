// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1'
    }
  };