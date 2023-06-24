// @ts-nocheck
import {h, toRef, ref, onMounted} from 'vue'
import { createUUID } from '../util/utils'
import ScreenStore from '../stores/ScreenStore'
import BitmapStore from '../stores/BitmapStore'
import {KeyDownBuilder} from "../builders/KeyDownBuilder";

const Char = {
    props: {
        memoryIndex: Number,
        charX: Number,
        charY: Number
    },
    setup(props) {
        const memoryIndex = toRef(props, 'memoryIndex')
        const char = ref(ScreenStore.createChar(memoryIndex.value))
        const uuid = ref(createUUID())
        ScreenStore.subscribe( (memoryIndexToRefresh) =>  {
            if (memoryIndex.value == memoryIndexToRefresh) {
                char.value = ScreenStore.createChar(memoryIndex.value)
            }
        })



        return { memoryIndex, char, uuid }
    },
    render() {
        //console.log('Char Render')
        let mcmExtension = ''
        if (BitmapStore.isMCM()) {
            mcmExtension = 'MCM'
        }
        let css = 'gridChar' + mcmExtension
        if (ScreenStore.getShowGridInChars()==false) {
            css = 'gridCharWithoutGrid' + mcmExtension
        }
        return h('div', { memIndex: this.memoryIndex, key: this.uuid, 'data-char-x': this.charX, 'data-char-y': this.charY, class: css }, this.char)
    }

}

export { Char }