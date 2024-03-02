// @ts-nocheck
import { createApp } from 'vue'
import { Screen } from './components/Screen'
import App from './components/App.vue'
import Antd from 'ant-design-vue'
import ColorPicker from 'vue-color-kit'

import './justpixel.css'
//import './justpixel.antd.dark.css'
import 'ant-design-vue/dist/reset.css'
import 'vue-color-kit/dist/vue-color-kit.css'

const app = createApp(App)

//app.component('screen', App)
//app.component('screen', Screen)
app.use(Antd)
app.use(ColorPicker)
app.mount('#app')

