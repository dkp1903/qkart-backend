// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
// Find configuration options listed here - https://jestjs.io/docs/en/configuration
module.exports = {
  testEnvironment: "node",
  // Overwrite the "NODE_ENV" variable when running tests
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  restoreMocks: true,
  // CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
  // NOTE - Not used in project
  // Not removing due to possible future usage
  coveragePathIgnorePatterns: [
    "node_modules",
    "src/config",
    "src/app.js",
    "tests",
  ],
  coverageReporters: ["text", "lcov", "clover", "html"],
  // CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
};
