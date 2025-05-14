const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // 在这里实现节点事件监听器和Cypress任务
    },
    baseUrl: 'http://localhost:5173', // 前端应用的本地开发URL
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 6000,
    video: false, // 是否在CI环境中录制视频
  },
}); 