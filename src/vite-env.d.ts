/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const vueComponent: DefineCompoenet<{}, {}, any>

  export default vueComponent
}
