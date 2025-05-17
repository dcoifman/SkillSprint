module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^three/examples/jsm/loaders/GLTFLoader$': '<rootDir>/src/__mocks__/GLTFLoader.js',
    '^three/examples/jsm/loaders/DRACOLoader$': '<rootDir>/src/__mocks__/DRACOLoader.js',
    '^three$': '<rootDir>/src/__mocks__/three.js',
    '^@react-three/fiber$': '<rootDir>/src/__mocks__/react-three-fiber.js',
    '^@react-three/drei$': '<rootDir>/src/__mocks__/react-three-drei.js',
    '^@react-three/postprocessing$': '<rootDir>/src/__mocks__/react-three-postprocessing.js',
    '^postprocessing$': '<rootDir>/src/__mocks__/postprocessing.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!three|@react-three|postprocessing).+\\.js$'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    }]
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}; 