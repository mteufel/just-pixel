import { h, toRef, ref } from 'vue'
import { createUUID } from '../utils.js'
import ScreenStore from '../stores/ScreenStore'
import BitmapStore from '../stores/BitmapStore'

const Char = {
    props: {
        memoryIndex: Number,
        charX: Number,
        charY: Number
    },
    setup(props) {
        const memoryIndex = toRef(props, 'memoryIndex')
        const char = ref(ScreenStore.createChar(memoryIndex.value))
        ScreenStore.subscribe( (memoryIndexToRefresh) =>  {
            if (memoryIndex.value == memoryIndexToRefresh) {
                char.value = ScreenStore.createChar(memoryIndex.value)
            }
        })
        return { memoryIndex, char }
    },
    render() {
        let mcmExtension = ''
        if (BitmapStore.isMCM()) {
            mcmExtension = 'MCM'
        }
        let css = 'gridChar' + mcmExtension
        if (ScreenStore.getShowGridInChars()==false) {
            css = 'gridCharWithoutGrid' + mcmExtension
        }
        return h('div', { memIndex: this.memoryIndex, key: createUUID(), 'data-char-x': this.charX, 'data-char-y': this.charY, class: css }, this.char)
    }

}

export { Char }