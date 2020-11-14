import { h, onMounted } from 'vue'
import BitmapStore from '../stores/BitmapStore.js';
import ScreenStore from '../stores/ScreenStore.js';
import {Toolbar} from "./Toolbar.js";
import {ColorSelector} from "./ColorSelector.js";
import {Preview} from "./Preview.js";

const Screen = {

    setup() {

        BitmapStore.clearBitmap()

        onMounted(() => {
            //const self = this

            ScreenStore.actionNew()

            window.addEventListener("keydown", function(e) {
                e.preventDefault()
                if (e.key === 'c') {
                    ScreenStore.actionNew()
                }

                if (e.key === 'g') {
                    ScreenStore.actionGrid()
                }

                if (e.key === '1') {
                    let index = ScreenStore.getMemoryPosition() + ScreenStore.getCursorY()
                    console.log(index)
                    BitmapStore.flipBit(index, 7-ScreenStore.getCursorX())
                    ScreenStore.refreshChar();
                }

                if (e.key === 'ArrowDown') {
                    ScreenStore.cursorDown()
                }

                if (e.key === 'ArrowUp') {
                    ScreenStore.cursorUp()
                }

                if (e.key === 'ArrowRight' && e.shiftKey==false) {
                    ScreenStore.cursorRight()
                }

                if (e.key === 'ArrowLeft' && e.shiftKey==false) {
                    ScreenStore.cursorLeft()
                }

            });
        })

        return () => {
            return h('div', { class: 'main' }, [
                h('div', { class: 'toolbar' }, h(Toolbar)),
                h('div', { class: 'gridBitmap66' }, ScreenStore.build(6,6,0,0),
                h('div', { class: 'colorSelector' }, h(ColorSelector)) ),
                h(Preview),

            ]);
        }

    }
}

export { Screen }
