// @ts-nocheck
import { createApp } from 'vue'
import { Screen } from './components/Screen'
import Antd from 'ant-design-vue'
import ColorPicker from 'vue-color-kit'

import './justpixel.css'
import './justpixel.antd.dark.css'
import 'vue-color-kit/dist/vue-color-kit.css'

const app = createApp({})

app.component('screen', Screen)
app.use(Antd)
app.use(ColorPicker)
app.mount('#app')

