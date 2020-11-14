import {h, ref, reactive, onMounted} from 'vue'
import { DoubleLeftOutlined } from '@ant-design/icons-vue'
import ScreenStore from "../stores/ScreenStore"
import BitmapStore from "../stores/BitmapStore"
import ColorCollectionStore from "../stores/ColorCollectionStore.js"

const ColorSelector = {

    setup() {

        let setIndex = ref(0)
        let collectionIndex = ref(-1)
        let sets = reactive([
            createEmptySet(0, 'F5'),
            createEmptySet(1, 'F6'),
            createEmptySet(2, 'F7'),
            createEmptySet(3, 'F8'),
            createEmptySet(4, 'F9'),
            createEmptySet(5, 'F10'),
            createEmptySet(6, 'F11'),
            createEmptySet(7, 'F12')
        ])

        let backgroundIndex = ref(0)
        let foregroundIndex = ref(0)
        let r1 = ref(0)
        let g1 = ref(0)
        let b1 = ref(0)

        let r2 = ref(0)
        let g2 = ref(0)
        let b2 = ref(0)

        const refreshSelectedColors = (memoryPosition) => {
            let colBackground = BitmapStore.getBackgroundColor(memoryPosition)
            r1.value = colBackground.r
            g1.value = colBackground.g
            b1.value = colBackground.b
            let colForeground = BitmapStore.getForegroundColor(memoryPosition)
            r2.value = colForeground.r
            g2.value = colForeground.g
            b2.value = colForeground.b
        }

        ScreenStore.subscribeCharChange( (memoryPosition) => {
            refreshSelectedColors(memoryPosition)
        } )

        onMounted(() => {
            const self = this
            window.addEventListener("keydown", function(e) {
                e.preventDefault()
                if (e.key === 'F1') {
                    let index = sets[setIndex.value].paletteIndexBg;
                    index = index + 1;
                    if (index == 16) {
                        index = 0
                    }
                    let col = BitmapStore.getColorByIndex(index)
                    sets[setIndex.value].bg_r = col.r
                    sets[setIndex.value].bg_g = col.g
                    sets[setIndex.value].bg_b = col.b
                    sets[setIndex.value].paletteIndexBg = index
                }
                if (e.key === 'F2') {
                    let index = sets[setIndex.value].paletteIndexFg;
                    index = index + 1;
                    if (index == 16) {
                        index = 0
                    }
                    let col = BitmapStore.getColorByIndex(index)
                    sets[setIndex.value].fg_r = col.r
                    sets[setIndex.value].fg_g = col.g
                    sets[setIndex.value].fg_b = col.b
                    sets[setIndex.value].paletteIndexFg = index
                }

                if (e.key === 'F3') {
                    collectionIndex.value = collectionIndex.value + 1
                    if (collectionIndex.value == 3)
                        collectionIndex.value = 0;
                    sets = ColorCollectionStore.setCollection(sets, collectionIndex.value)
                }

                if (e.key === 'ArrowRight' && e.shiftKey==true) {
                    setIndex.value = setIndex.value + 1
                    if (setIndex.value == 8) {
                        setIndex.value = 0
                    }
                }

                if (e.key === 'ArrowLeft' && e.shiftKey==true) {
                    setIndex.value = setIndex.value - 1
                    if (setIndex.value == -1) {
                        setIndex.value = 7
                    }
                }

                if (e.key === 'Enter') {
                    jumpToSet(sets, setIndex.value)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F5') {
                    setIndex.value = 0
                    jumpToSet(sets, 0)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F6') {
                    setIndex.value = 1
                    jumpToSet(sets, 1)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F7') {
                    setIndex.value = 2
                    jumpToSet(sets, 2)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F8') {
                    setIndex.value = 3
                    jumpToSet(sets, 3)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F9') {
                    setIndex.value = 4
                    jumpToSet(sets, 4)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F10') {
                    setIndex.value = 5
                    jumpToSet(sets, 5)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F11') {
                    setIndex.value = 6
                    jumpToSet(sets, 6)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }

                if (e.key === 'F12') {
                    setIndex.value = 7
                    jumpToSet(sets, 7)
                    refreshSelectedColors(ScreenStore.getMemoryPosition())
                }


            });
        })

        return () => {

            sets.forEach( (set, idx) => {
                if (idx == setIndex.value) {
                    set.css='colorPixelBlockSelected'
                } else {
                    set.css='colorPixelBlock'
                }
            })

            return [
                h('div', ScreenStore.createColorPixelBlock(r1.value,g1.value,b1.value) ),
                h('div', ScreenStore.createColorPixelBlock(r2.value,g2.value,b2.value) ),
                h('div' ),
                h('div', { style: 'color: #aaaaaa' }, h(DoubleLeftOutlined) ),
                h('div' ),
                h('div', { class: 'set-f-key' }, sets[0].key),
                h('div', sets[0].createPixelBlockBackground() ),
                h('div', sets[0].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[1].key),
                h('div', sets[1].createPixelBlockBackground() ),
                h('div', sets[1].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[2].key),
                h('div', sets[2].createPixelBlockBackground() ),
                h('div', sets[2].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[3].key),
                h('div', sets[3].createPixelBlockBackground() ),
                h('div', sets[3].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[4].key),
                h('div', sets[4].createPixelBlockBackground() ),
                h('div', sets[4].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[5].key),
                h('div', sets[5].createPixelBlockBackground() ),
                h('div', sets[5].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[6].key),
                h('div', sets[6].createPixelBlockBackground() ),
                h('div', sets[6].createPixelBlockForeground() ),
                h('div', { class: 'set-f-key' }, sets[7].key),
                h('div', sets[7].createPixelBlockBackground() ),
                h('div', sets[7].createPixelBlockForeground() ),
            ]
        }
    }
}

const createEmptySet = (idx, fkey) => {
    return {
        index: idx,
        key: fkey,
        css: 'colorPixelBlock',
        paletteIndexFg: 0,
        paletteIndexBg: 0,
        fg_r: 0,
        fg_g: 0,
        fg_b: 0,
        bg_r: 0,
        bg_g: 0,
        bg_b: 0,
        createPixelBlockForeground: function() {
            return ScreenStore.createColorPixelBlock(this.fg_r,this.fg_g,this.fg_b, this.css)
        },
        createPixelBlockBackground: function() {
            return ScreenStore.createColorPixelBlock(this.bg_r,this.bg_g,this.bg_b, this.css)
        }
    }
}

const jumpToSet = (sets, idx) => {
    let colFg = BitmapStore.getColorByIndex(sets[idx].paletteIndexFg)
    let colBg = BitmapStore.getColorByIndex(sets[idx].paletteIndexBg)
    BitmapStore.setForegroundColor(ScreenStore.getMemoryPosition(), colFg.colorIndexHex)
    BitmapStore.setBackgroundColor(ScreenStore.getMemoryPosition(), colBg.colorIndexHex)
    ScreenStore.refreshChar()
}



export { ColorSelector }