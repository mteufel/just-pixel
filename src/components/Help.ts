// @ts-nocheck
import {h, ref } from 'vue'
import {Modal} from 'ant-design-vue'
import {createBasicDialogStore} from '../stores/BasicDialogStore'

const HelpStore = createBasicDialogStore()


const HelpContents = [
    h('p', 'Select Color: click a square on the bottom to select the color slot, then select a color in the palette'),
    h('p', 'Cursor Keys (or mouse): Move Cursor'),
    h('p', '1-4: Flip/Set Pixel in active Color Set (in C64 Hires Bitmaps two colors per 8x8 char possible') ,
    h('p', 'g: Turn on/off Grid'),
    h('p', 'Delete-key: Clear current char/block'),
    h('p', 'm: mark an area you need to press the m-key twice'),
    h('p', 'v: copy the marked area to the position where the cursor blinks'),
    h('p', 'd/#: dump developer information about the marked area/current block to console (console.log)'),
    h('p', 'e: export marked area (Kickassember Format, Basic, ...'),
    h('p', 's: export one sprite (starting at the position of the cursor, works only in Bitmap MCM)'),
    h('p', 'SHIFT+x: remember colors of the actual char'),
    h('p', 'x: take over the remembered colors into the current char'),
    h('p', ''),
    h('p', 'Actually, Bitmap Multicolor Mode ist implemented best as I need this mode for my actual project. Next thing on my list is finalizing FCM!'),
    h('p', 'Dont forget: just-pixel is work in progress! Things may change when other graphic modes of the MEGA65 will be integrated/stabilized.'),
    h('p', ''),
    h('a', { href: 'https://github.com/mteufel/just-pixel', target: '_blank' }, 'Click here to see the source code... (git repo) -> Branch TABLECLICK'),
    h('p', 'Written in pure JavaScript/TypeScript with Vue 3'),
    h('p', '(c) 2020-2024 Marc Teufel (Seytan/Reflex)'),
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