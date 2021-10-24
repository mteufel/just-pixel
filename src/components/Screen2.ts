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
import {GridBitmap} from "./GridBitmap";
import {KeyDownBuilder} from "../builders/KeyDownBuilder";


const Screen2 = {

    setup(context, { emit }) {
        console.log('Setup Screen......... ')

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
        })

        KeyDownBuilder.clearKeys()
        KeyDownBuilder.key('ArrowDown', () => ScreenStore.cursorDown())
        KeyDownBuilder.key('ArrowUp', () => ScreenStore.cursorUp())
        KeyDownBuilder.key('ArrowLeft', () => ScreenStore.cursorLeft())
        KeyDownBuilder.key('ArrowRight', () => ScreenStore.cursorRight())
        KeyDownBuilder.useKeys()



        return { modeCycle, modeSwitch}
    },
    render() {
        console.log('Render Screen......... ', this.modeCycle)
        let result = h('div', { class: 'main' }, [
            h('div', { class: 'toolbar' }, h(Toolbar, { onModeSwitch: (data) => this.modeSwitch(data) })),
            h('div', { class: 'paletteColor' }, h(ColorPalette)),
            h(GridBitmap),
            h(Preview),
            h('div', { class: 'emptyToolbarBackground' }, null),
            h('div', { class: 'empty' }, null),
            h('div', { class: 'statusBar' }, h(StatusBar)),
            h('div', { class: 'logoContainer' }, [ h('div', { class: 'mega65-logo' } )  ]  )
        ]);
        console.log('Render Screen End')
        return result
    }

}

export { Screen2 }

