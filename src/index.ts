// @ts-nocheck
import { createApp } from 'vue'
import { Screen2 } from './components/Screen2'
import Antd from 'ant-design-vue'
import ColorPicker from 'vue-color-kit'

import './justpixel.css'
import './justpixel.antd.dark.css'
import 'vue-color-kit/dist/vue-color-kit.css'

const app = createApp({})

app.component('screen', Screen2)
app.use(Antd)
app.use(ColorPicker)
app.mount('#app')

