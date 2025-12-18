// src/shims-vue.d.ts
/* eslint-disable */ // 可选：禁用 ESLint 检查，避免声明文件被 ESLint 报错
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 泛型参数使用 unknown，让 TypeScript 自动推导组件的具体类型，而不是固定为 {} 和 any
  const component: DefineComponent<unknown, unknown, unknown>
  export default component
}
