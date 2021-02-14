import {h, onMounted, ref } from 'vue'
import BitmapStore from '../stores/BitmapStore.js'
import ScreenStore from '../stores/ScreenStore.ts'
import {Toolbar} from './Toolbar.js'
import {ColorPalette} from './palette/ColorPalette'
import {StatusBar} from './StatusBar.js'
import {Preview} from './Preview.js'
import { createUUID } from '../utils'
import {NewStore} from "./NewModal";

const Screen = {

    setup(context) {
        //console.log('Setup Screen......... ')
        const x = ref(0)
        const y = ref(0)
        const modeCycle = ref(0)  // this special values is important when user switches between FCM or HIRES/MCM because,
                                  // these modes have a different bitmap layout its important to make sure to re-render
                                  // the screen and the preview in order to respect the correct offsets inside the bitmaps (8 bytes versus 64 bytes)
                                  // modeCycle is a number filled with an UUID, on eacht mode switch the UUID is refreshed, forcing screen and
                                  // Preview to re-render

        BitmapStore.clearBitmap()

        const modeSwitch = (d) => {
            modeCycle.value= createUUID()
        }


        onMounted(() => {



            ScreenStore.actionNew()

            window.addEventListener("keydown", function(e) {

                if (ScreenStore.isDialogOpen()) {
                    return
                }

                e.preventDefault()
                if (e.key === 'c') {

                    const createNew = () => {
                        NewStore.beforeDialogClose(modeSwitch)
                        NewStore.toggle()
                    }
                    createNew()


                }

                if (e.key === 'g') {
                    ScreenStore.actionGrid()
                }

                if (e.key === 'd') {
                    ScreenStore.dumpBlinkingCursor()
                    BitmapStore.dumpBitmap()
                }

                if (e.key === '1') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f')
                    } else {
                        ScreenStore.paint('b')
                    }

                }
                if (e.key === '2') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f2')
                    } else {
                        ScreenStore.paint('f')
                    }

                }
                if (e.key === '3') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f3')
                    } else {
                        ScreenStore.paint('f2')
                    }
                }
                if (e.key === '4') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f4')
                    } else {
                        ScreenStore.paint('f3')
                    }
                }
                if (e.key === '5') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f5')
                    }
                }

                if (e.key === '6') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f6')
                    }
                }

                if (e.key === 'ArrowDown' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false ) {
                    ScreenStore.cursorDown( () => {
                        if (y.value < 24 && ScreenStore.checkMemoryPositions()) {
                            y.value = y.value + 1
                            modeCycle.value = createUUID()
                        }
                    })
                }

                if (e.key === 'ArrowUp' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorUp(() => {
                        if (y.value > 0) {
                            y.value = y.value - 1
                            modeCycle.value = createUUID()
                        }
                    })
                }

                if (e.key === 'ArrowRight' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorRight( () => {
                        if (x.value + 12 < 40) {
                            x.value = x.value + 1
                            modeCycle.value = createUUID()
                        }
                    })
                }

                if (e.key === 'ArrowLeft' && e.altKey==false && e.shiftKey==false && e.ctrlKey==false) {
                    ScreenStore.cursorLeft( () => {
                        if (x.value > 0) {
                            x.value = x.value - 1
                            modeCycle.value = createUUID()
                        }
                    })
                }


            });
        })

     return { x, y, modeCycle, modeSwitch}
    },
    render() {
        //console.trace()
        //console.log('Render Screen......... ', this.modeCycle)
        //console.log(BitmapStore.getBitmap())
        let result
        let offset // offset defines number of data inside bitmap-data to define one 8x8 char
        ScreenStore.clearSubscribers()
        BitmapStore.clearSubscribers()
        if (BitmapStore.isFCM()) {
          //  console.log('...FCM')
            offset = 64
        } else {
          //  console.log('...OTHERS')
            offset = 8
        }

        ScreenStore.build(offset, 12, 8, this.x, this.y)
        let calculatedMemoryPosition = ScreenStore.getScreenStartMemoryPos() + ( ( (40*offset) * (ScreenStore.getCharY()-1) ) + (ScreenStore.getCharX()-1) * offset  )
        result = h('div', { class: 'main', key: this.modeCycle}, [
            h('div', { class: 'toolbar' }, h(Toolbar, { onModeSwitch: (data) => this.modeSwitch(data) })),
            h('div', { class: 'paletteColor' }, h(ColorPalette)),
            h('div', { class: 'gridBitmap128', }, [ScreenStore.getScreen(),
                    h('div', { class: 'colorSelector' }, h(StatusBar))
                ],
            ),
            h(Preview, { modeCycle: this.modeCycle}) ]);
        ScreenStore.setMemoryPosition(calculatedMemoryPosition)
        BitmapStore.callSubscribers() // repaint the preview (show cursor)
        return result
    }

}

export { Screen }

