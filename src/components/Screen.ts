// @ts-nocheck
import {h, onMounted, ref } from 'vue'
import BitmapStore from '../stores/BitmapStore'
import ScreenStore from '../stores/ScreenStore'
import {Toolbar} from './Toolbar'
import {ColorPalette} from './palette/ColorPalette'
import {StatusBar} from './StatusBar'
import {Preview} from './Preview'
import { createUUID } from '../utils'
import {NewStore} from './NewModal';
import {CopyContext} from '../stores/CopyContext';
import ColorPaletteStore from "../stores/ColorPaletteStore";

const Screen = {

    setup(context, { emit }) {
        console.log('Setup Screen......... ')
        const x = ref(0)
        const y = ref(0)
        const modeCycle = ref(0)  // this special values is important when user switches between FCM or HIRES/MCM because,
                                  // these modes have a different bitmap layout its important to make sure to re-render
                                  // the screen and the preview in order to respect the correct offsets inside the bitmaps (8 bytes versus 64 bytes)
                                  // modeCycle is a number filled with an UUID, on each mode switch the UUID is refreshed, forcing screen and
                                  // Preview to re-render

        BitmapStore.clearBitmap()
        ColorPaletteStore.initPalette()


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

                if (e.key === '#') {
                    console.log('Byte-Dumper 3x3')

                    console.log('char #1 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(0,7+1).forEach( (i,v) => console.log (i + ' - ' + v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[0] + ", " + BitmapStore.getColorRam()[0])
                    console.log('char #2 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(8,15+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[1] + ", " + BitmapStore.getColorRam()[1])
                    console.log('char #3 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(16,23+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[2] + ", " + BitmapStore.getColorRam()[2])
                    console.log('char #4 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(320,327+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[40] + ", " + BitmapStore.getColorRam()[40])
                    console.log('char #5 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(328,335+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[41] + ", " + BitmapStore.getColorRam()[41])
                    console.log('char #6 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(336,343+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[42] + ", " + BitmapStore.getColorRam()[42])
                    console.log('char #7 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(640,647+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[80] + ", " + BitmapStore.getColorRam()[80])
                    console.log('char #8 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(648,655+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[81] + ", " + BitmapStore.getColorRam()[81])
                    console.log('char #9 ------------------------------------------------')
                    BitmapStore.getBitmap().slice(656,663+1).forEach( v => console.log (v + ','))
                    console.log('Screen/Col: ' + BitmapStore.getScreenRam()[82] + ", " + BitmapStore.getColorRam()[82])


                }



                if (e.key === 'Delete') {
                    let cc = ScreenStore.getCopyContext()
                    let a = cc.startMemPos
                    let e = cc.endMemPos
                    ScreenStore.setCopyContext(CopyContext())
                    ScreenStore.refreshChar(a)
                    ScreenStore.refreshChar(e)
                }

                if (e.key === 'v'  && e.altKey==false && e.shiftKey==false && e.ctrlKey==true ) {
                    console.log('jetzt wird eingefügt - copyable = ' , ScreenStore.getCopyContext().isCopyable())

                    let sourceIndex = ScreenStore.getCopyContext().getSourceIndexList()
                    let destIndex = ScreenStore.getCopyContext().getDestinationIndexList(ScreenStore.getMemoryPosition())
                    console.log('--> src ', sourceIndex )
                    console.log('--> dest ', destIndex )


                    BitmapStore.setBitmap ( ScreenStore.getCopyContext().copyBitmap(BitmapStore.getBitmap(), ScreenStore.getMemoryPosition()) )
                    BitmapStore.setScreenRam( ScreenStore.getCopyContext().copyScreenRam(BitmapStore.getScreenRam(), ScreenStore.getMemoryPosition()) )
                    if (BitmapStore.isMCM()) {
                        BitmapStore.setColorRam( ScreenStore.getCopyContext().copyColorRam(BitmapStore.getColorRam(), ScreenStore.getMemoryPosition()) )
                    }
                    ScreenStore.refreshAll()
                    BitmapStore.callSubscribers()


                }

                if (e.key === 'c') {

                    let cc = ScreenStore.getCopyContext()
                    console.log('c .. ', cc)
                    if ( cc.endMemPos > -1) {

                        // evt alte visuelle Markierung entfernen
                        let a = cc.startMemPos
                        let e = cc.endMemPos
                        ScreenStore.setCopyContext(CopyContext())
                        ScreenStore.refreshChar(a)
                        ScreenStore.refreshChar(e)

                        cc.startMemPos = ScreenStore.getMemoryPosition()
                        cc.startCharX = ScreenStore.getCharX()
                        cc.startCharY = ScreenStore.getCharY()
                        cc.endMemPos = -1
                        cc.endCharX = -1
                        cc.endCharY = -1
                    } else {
                        cc.endMemPos = ScreenStore.getMemoryPosition()
                        cc.endCharX = ScreenStore.getCharX()
                        cc.endCharY = ScreenStore.getCharY()
                        console.log('else .... ', cc)
                        if (cc.endMemPos < cc.startMemPos || cc.endCharX < cc.startCharX) {

                            let cc = ScreenStore.getCopyContext()
                            cc.startMemPos = 999999
                            ScreenStore.setCopyContext(cc)


                            let x = cc
                            x.startMemPos = cc.endMemPos
                            x.startCharX = cc.endCharX
                            x.startCharY = cc.endCharY
                            x.endMemPos = cc.startMemPos
                            x.endCharX = cc.startCharX
                            x.endCharY = cc.startCharY
                            cc = x
                            ScreenStore.refreshAll()
                        }




                    }
                    ScreenStore.setCopyContext(cc)
                    ScreenStore.refreshChar(cc.startMemPos)
                    ScreenStore.refreshChar(cc.endMemPos)

                }



                if (e.key === 'n') {

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

                if (e.key === '7') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f7')
                    }
                }

                if (e.key === '8') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f8')
                    }
                }

                if (e.key === '9') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f9')
                    }
                }

                if (e.key === '0') {
                    if (BitmapStore.isFCM()) {
                        ScreenStore.paint('f0')
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
        result = h('div', { class: 'main', key: this.modeCycle }, [
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

