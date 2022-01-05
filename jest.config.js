module.exports = {
    verbose: true,
    projects: [
      {
        displayName: 'unit',
        testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
        moduleFileExtensions: ['ts', 'js', 'node'],
        transform: {
          '^.+\\.tsx?$': 'ts-jest',
        },
      }
    ],
  };
  