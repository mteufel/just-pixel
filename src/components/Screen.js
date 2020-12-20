import {h, onMounted, ref, reactive} from 'vue'
import BitmapStore from '../stores/BitmapStore.js';
import ScreenStore from '../stores/ScreenStore.js';
import {Toolbar} from "./Toolbar.js";
import {ColorSelector} from "./ColorSelector.js";
import {Preview} from "./Preview.js";

const Screen = {

    setup() {

        const x = ref(0)
        const y = ref(0)

        BitmapStore.clearBitmap()

        onMounted(() => {
            //const self = this

            ScreenStore.actionNew()

            window.addEventListener("keydown", function(e) {

                if (ScreenStore.isDialogOpen()) {
                    return
                }

                e.preventDefault()
                if (e.key === 'c') {
                    ScreenStore.actionNew()
                }

                if (e.key === 'g') {
                    ScreenStore.actionGrid()
                }

                if (e.key === 'x') {
                    ScreenStore.dumpBlinkingCursor()
                }


                if (e.key === '1') {
                    let index = ScreenStore.getMemoryPosition() + ScreenStore.getCursorY()
                    BitmapStore.flipBit(index, 7-ScreenStore.getCursorX())
                    ScreenStore.refreshChar();
                }

                if (e.key === 'ArrowDown' && e.shiftKey==false && e.ctrlKey==false ) {
                    ScreenStore.cursorDown()
                }

                if (e.key === 'ArrowUp'&& e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorUp()
                }

                if (e.key === 'ArrowRight' && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorRight()
                }

                if (e.key === 'ArrowLeft' && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorLeft()
                }

                if (e.key === 'ArrowLeft' && e.shiftKey==true && e.ctrlKey==false) {
                    if (x.value > 0) {
                        x.value = x.value - 1
                    }
                }
                if (e.key === 'ArrowRight' && e.shiftKey==true && e.ctrlKey==false) {
                    x.value = x.value + 1
                }

                if (e.key === 'ArrowUp'&& e.shiftKey==true && e.ctrlKey==false) {
                    if (y.value > 0) {
                        y.value = y.value - 1
                    }
                }
                if (e.key === 'ArrowDown' && e.shiftKey==true && e.ctrlKey==false) {
                    if (y.value < 19) {
                        y.value = y.value + 1
                    }

                }

            });
        })

        return { x, y }
    },
    render() {

        ScreenStore.clearSubscribers()
        ScreenStore.build(6,6,this.x,this.y)
        let calculatedMemoryPosition = ScreenStore.getScreenStartMemoryPos() + ( ( (40*8) * (ScreenStore.getCharY()-1) ) + (ScreenStore.getCharX()-1) * 8  )
        let result = h('div', { class: 'main' }, [
            h('div', { class: 'toolbar' }, h(Toolbar)),
            h('div', { class: 'gridBitmap66' }, ScreenStore.getScreen(),
            h('div', { class: 'colorSelector' }, h(ColorSelector)) ),
            h(Preview) ]);
        ScreenStore.setMemoryPosition(calculatedMemoryPosition)
        BitmapStore.callSubscribers() // repaint the preview (show cursor)
        return result
    }

}

export { Screen }

