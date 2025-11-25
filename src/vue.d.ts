// src/shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 泛型参数：Props类型、Emits类型、Slots类型（默认any即可）
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}
