export default {
  testEnvironment: 'jest-environment-jsdom',
  // Чтобы не импортировать jest-dom каждый раз при создании теста,
  // можно настроить конфигурацию Jest
  setupFilesAfterEnv: [ '@testing-library/jest-dom' ],
};