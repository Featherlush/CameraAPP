// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// 注意：扁平配置中，忽略文件直接在配置中用 ignores 定义，而非 globalIgnores（旧版语法）
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    // 定义需要忽略的文件/目录（替代原来的 globalIgnores）
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Vue 必备规则（essential 是核心规则，包含错误检查）
  pluginVue.configs['flat/essential'],
  // Vue + TS 推荐规则
  vueTsConfigs.recommended,

  // Vitest 测试规则：仅作用于测试文件
  {
    ...pluginVitest.configs.recommended,
    // 匹配 src 下的 __tests__ 目录，以及 .spec/.test 后缀的 ts/tsx 文件
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.{spec,test}.{ts,tsx}'],
  },

  // Playwright E2E 测试规则
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  // 关闭格式化相关规则（交给 Prettier）
  skipFormatting,
)
