// @ts-nocheck
import { createApp } from 'vue'
import App from './components/App.vue'
import Antd from 'ant-design-vue'
import ColorPicker from 'vue-color-kit'

import './justpixel.css'
import 'ant-design-vue/dist/reset.css'
import 'vue-color-kit/dist/vue-color-kit.css'

const app = createApp(App)

app.use(Antd)
app.use(ColorPicker)
app.mount('#app')