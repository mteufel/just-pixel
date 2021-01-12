import {h, onMounted, ref } from 'vue'
import BitmapStore from '../stores/BitmapStore.js'
import ScreenStore from '../stores/ScreenStore.ts'
import {Toolbar} from './Toolbar.js'
import {ColorPalette} from './palette/ColorPalette'
import {StatusBar} from './StatusBar.js'
import {Preview} from './Preview.js'

const Screen = {

    setup() {

        const x = ref(0)
        const y = ref(0)

        BitmapStore.clearBitmap()

        onMounted(() => {

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

                if (e.key === 'd') {
                    ScreenStore.dumpBlinkingCursor()
                    BitmapStore.dumpBitmap()
                }

                if (e.key === '1') {
                    ScreenStore.paint('b')
                }
                if (e.key === '2') {
                    ScreenStore.paint('f')
                }
                if (e.key === '3') {
                    ScreenStore.paint('f2')
                }
                if (e.key === '4') {
                    ScreenStore.paint('f3')
                }

                if (e.key === 'ArrowDown' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false ) {
                    ScreenStore.cursorDown()
                }

                if (e.key === 'ArrowUp' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorUp()
                }

                if (e.key === 'ArrowRight' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorRight()
                }

                if (e.key === 'ArrowLeft' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorLeft()
                }

                if (e.key === 'ArrowLeft' && e.altKey==false && e.shiftKey==true && e.ctrlKey==false) {
                    if (x.value > 0) {
                        x.value = x.value - 1
                    }
                }
                if (e.key === 'ArrowRight' && e.altKey==false && e.shiftKey==true && e.ctrlKey==false) {
                    x.value = x.value + 1
                }

                if (e.key === 'ArrowUp' && e.altKey==false && e.shiftKey==true && e.ctrlKey==false) {
                    if (y.value > 0) {
                        y.value = y.value - 1
                    }
                }
                if (e.key === 'ArrowDown' && e.altKey==false && e.shiftKey==true && e.ctrlKey==false) {
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
        ScreenStore.build(12,8,this.x,this.y)
        let calculatedMemoryPosition = ScreenStore.getScreenStartMemoryPos() + ( ( (40*8) * (ScreenStore.getCharY()-1) ) + (ScreenStore.getCharX()-1) * 8  )
        let result = h('div', { class: 'main' }, [
            h('div', { class: 'toolbar' }, h(Toolbar)),
            h('div', { class: 'paletteColor' }, h(ColorPalette)),
            h('div', { class: 'gridBitmap128' }, [ScreenStore.getScreen(),
                                                 h('div', { class: 'colorSelector' }, h(StatusBar))
                                                ],
            ),
            h(Preview) ]);
        ScreenStore.setMemoryPosition(calculatedMemoryPosition)
        BitmapStore.callSubscribers() // repaint the preview (show cursor)
        return result
    }

}

export { Screen }

