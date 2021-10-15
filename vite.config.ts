import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(
    {
      plugins: [vue()],
      resolve: { alias: { 'vue': 'vue/dist/vue.esm-bundler.js' } }
    }
)




//export default defineConfig({ define: { 'process.env': {} }, plugins: [vue()], resolve: { alias: { 'vue': 'vue/dist/vue.esm-bundler.js' } } })