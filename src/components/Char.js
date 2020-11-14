import { h, toRef, ref } from 'vue'
import ScreenStore from '../stores/ScreenStore.js'

const Char = {
    props: {
        memoryIndex: Number
    },
    setup(props) {
        const memoryIndex = toRef(props, 'memoryIndex')
        const char = ref(ScreenStore.createChar(memoryIndex.value))
        ScreenStore.subscribe( (memoryIndexToRefresh) =>  {
            if (memoryIndex.value == memoryIndexToRefresh) {
                char.value = ScreenStore.createChar(memoryIndex.value)
            }
        })
        return () => {
            let css = 'gridChar'
            if (ScreenStore.getShowGridInChars()==false) {
                css = 'gridCharWithoutGrid'
            }
            return h('div', { class: css }, char.value)
        }
    }

}

export { Char }