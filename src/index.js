import { createApp } from 'vue'
import { Screen } from './components/Screen.js';
import Antd from 'ant-design-vue'

import './justpixel.css'
import './justpixel.antd.dark.css'

console.log(' start !!! ')


const app = createApp({})

app.component('screen', Screen)
app.use(Antd)
app.mount('#app')

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        app.unmount();
    });
}
