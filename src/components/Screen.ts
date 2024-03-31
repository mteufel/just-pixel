// @ts-nocheck
import {h, onMounted, ref } from 'vue'
import BitmapStore from '../stores/BitmapStore'
import ScreenStore from '../stores/ScreenStore'
import {Toolbar} from './Toolbar'
import {ColorPalette} from './palette/ColorPalette'
import {StatusBar} from './StatusBar'
import {Preview} from './Preview'
import { createUUID } from '../util/utils'
import {NewStore} from './NewModal';
import {CopyContext} from '../stores/CopyContext';
import ColorPaletteStore from "../stores/ColorPaletteStore";
import {GridBitmap} from "./GridBitmap";
import {KeyDownBuilder} from "../builders/KeyDownBuilder";
import {defineCursorKeys, definePaintKeys} from "../util/keys";
import {autoload} from "../util/autoload";


const Screen = {

    setup(context, { emit }) {
        console.log('Setup Screen......... ')

        const modeCycle = ref(0)  // this special values is important when user switches between FCM or HIRES/MCM because,
                                  // these modes have a different bitmap layout its important to make sure to re-render
                                  // the screen and the preview in order to respect the correct offsets inside the bitmaps (8 bytes versus 64 bytes)
                                  // modeCycle is a number filled with an UUID, on each mode switch the UUID is refreshed, forcing screen and
                                  // Preview to re-render

        BitmapStore.clearBitmap()



        const modeSwitch = (d) => {
            console.log('mode Switch ist erfolgt')
            modeCycle.value= createUUID()
        }

        onMounted(() => {
            // if autoload is active (see autoload.ts for the bloody details) then load sample pixels
            // otherweise make a clean screen
            if (!autoload()) {
                ScreenStore.actionNew()
            }
        })

        KeyDownBuilder.clearKeys()
        defineCursorKeys()
        definePaintKeys()
        KeyDownBuilder.useKeys()


        return { modeCycle, modeSwitch}
    },
    render() {
        console.log('Render Screen......... ', this.modeCycle)
        ColorPaletteStore.initPalette()
        let result = h('div', { class: 'main' }, [
            h('div', { class: 'toolbar' }, h(Toolbar, { key: this.modeCycle, onModeSwitch: (data) => this.modeSwitch(data) })),
            h('div', { class: 'paletteColor' }, h(ColorPalette, { key: this.modeCycle })),
            h(GridBitmap, { key: this.modeCycle }),
            h(Preview, { key: this.modeCycle }),
            h('div', { class: 'emptyToolbarBackground' }, null),
            h('div', { class: 'empty' }, null),
            h('div', { class: 'statusBar' }, h(StatusBar, { key: this.modeCycle }) ),
            h('div', { class: 'logoContainer' }, [ h('div', { class: 'mega65-logo' } )  ]  )
        ]);
        console.log('Render Screen End')
        return result
    }

}

export { Screen }

