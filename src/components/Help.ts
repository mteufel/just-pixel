// @ts-nocheck
import {h, ref } from 'vue'
import {Modal} from 'ant-design-vue'
import {createBasicDialogStore} from '../stores/BasicDialogStore'

const HelpStore = createBasicDialogStore()


const HelpContents = [
    h('p', 'Cursor Keys: Move Cursor'),
    h('p', 'Shift + Cursor Keys: Move inside the Bitmap'),
    h('p', '1: Flip Pixel in active Color Set (in C64 Hires Bitmaps two colors per 8x8 char possible'),
    h('p', 'F5-F12: Select and activate the Color Set'),
    h('p', 'CTRL + Cursor Left/Right: Switch between Color Sets (same as above without activating). To activate press ENTER.'),
    h('p', 'F1/F2: Define Colors in selected Color Set'),
    h('p', 'F3: Select between some pre-defined Color Sets...'),
    h('p', 'G: Turn on/off Grid'),
    h('p', ''),
    h('p', ''),
    h('p', 'Dont forget: just-pixel is work in progress! Things may change when other graphic modes of the MEGA65 will be integrated.'),
    h('a', { href: 'https://github.com/mteufel/just-pixel', target: '_blank' }, 'Click here to see the source code... (git repo)'),
    h('p', 'Written in pure JavaScript with Vue3, (c) 2020/2021 Marc Teufel'),
]

const Help = {
    setup() {
        const helpVisible = ref(HelpStore.isVisible())
        HelpStore.subscribe( () => helpVisible.value = HelpStore.isVisible())
        return { helpVisible }
    },
    render() {
        return h(Modal, { onCancel: () => HelpStore.toggle(),
                           visible: this.helpVisible,
                          closable: true,
                            footer: null,
                             title: 'Help' } , HelpContents )
    }
}

export { Help, HelpStore }