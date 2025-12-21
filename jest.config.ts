import type { Config } from "jest";

const config: Config = {
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "./coverage",
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "^@fp8proj$": "<rootDir>/src/index",
    "^@fp8proj/(.*)$": "<rootDir>/src/$1",
  },
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["**/test/*.spec.ts", "**/test/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        "ts-jest": {
          tsconfig: "./tsconfig.test.json",
        },
      },
    ],
  },
  verbose: true,
};

export default config;
