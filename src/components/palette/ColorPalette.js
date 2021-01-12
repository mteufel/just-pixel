import {h, onMounted, ref, reactive} from 'vue'
import ScreenStore from "../../stores/ScreenStore"
import BitmapStore from "../../stores/BitmapStore"

// Colors (c) by Deekay/Crest
/*
const defaultColors = [
    { color: 'black',       colorIndex: 0,  colorIndexHex: 0x0, colorCodeHex: 0x0a0a0a, r: 10, g: 10, b: 10 },
    { color: 'white',       colorIndex: 1,  colorIndexHex: 0x1, colorCodeHex: 0xfff8ff, r: 255, g: 248, b: 255 },
    { color: 'red',         colorIndex: 2,  colorIndexHex: 0x2, colorCodeHex: 0x851f02, r: 133, g: 31, b: 2 },
    { color: 'cyan',        colorIndex: 3,  colorIndexHex: 0x3, colorCodeHex: 0x65cda8, r: 101, g: 205, b: 169 },
    { color: 'purple',      colorIndex: 4,  colorIndexHex: 0x4, colorCodeHex: 0xa73b9f, r: 167, g: 59, b: 159 },
    { color: 'green',       colorIndex: 5,  colorIndexHex: 0x5, colorCodeHex: 0x4dab19, r: 77, g: 171, b: 25 },
    { color: 'blue',        colorIndex: 6,  colorIndexHex: 0x6, colorCodeHex: 0x1a0c92, r: 26, g: 12, b: 146 },
    { color: 'yellow',      colorIndex: 7,  colorIndexHex: 0x7, colorCodeHex: 0xebe353, r: 235, g: 227, b: 83 },
    { color: 'orange',      colorIndex: 8,  colorIndexHex: 0x8, colorCodeHex: 0xa94b02, r: 169, g: 74, b: 2 },
    { color: 'brown',       colorIndex: 9,  colorIndexHex: 0x9, colorCodeHex: 0x441e00, r: 68, g: 30, b: 0 },
    { color: 'light red',   colorIndex: 10, colorIndexHex: 0xa, colorCodeHex: 0xd28074, r: 210, g: 128, b: 116 },
    { color: 'dark grey',   colorIndex: 11, colorIndexHex: 0xb, colorCodeHex: 0x464646, r: 70, g: 70, b: 70 },
    { color: 'grey',        colorIndex: 12, colorIndexHex: 0xc, colorCodeHex: 0x8b8b8b, r: 139, g: 139, b: 139 },
    { color: 'light green', colorIndex: 13, colorIndexHex: 0xd, colorCodeHex: 0x8ef68e, r: 142, g: 246, b: 142 },
    { color: 'light blue',  colorIndex: 14, colorIndexHex: 0xe, colorCodeHex: 0x4d91d1, r: 77, g: 145, b: 209 },
    { color: 'light grey',  colorIndex: 15, colorIndexHex: 0xf, colorCodeHex: 0xbababa, r: 186, g: 186, b: 186 },
]*/

const defaultColors = [
    { color: 'black',       colorIndex: 0,  colorIndexHex: 0x0, colorCodeHex: 0x000000, r: 0, g: 0, b: 0 },
    { color: 'white',       colorIndex: 1,  colorIndexHex: 0x1, colorCodeHex: 0xffffff, r: 255, g: 255, b: 255 },
    { color: 'red',         colorIndex: 2,  colorIndexHex: 0x2, colorCodeHex: 0x68372b, r: 0x68, g: 0x37, b: 0x2b },
    { color: 'cyan',        colorIndex: 3,  colorIndexHex: 0x3, colorCodeHex: 0x70a4b2, r: 0x70, g: 0xa4, b: 0xb2 },
    { color: 'purple',      colorIndex: 4,  colorIndexHex: 0x4, colorCodeHex: 0x6f3d86, r: 0x6f, g: 0x3d, b: 0x86 },
    { color: 'green',       colorIndex: 5,  colorIndexHex: 0x5, colorCodeHex: 0x588d43, r: 0x58, g: 0x85, b: 0x43 },
    { color: 'blue',        colorIndex: 6,  colorIndexHex: 0x6, colorCodeHex: 0x352879, r: 0x35, g: 0x28, b: 0x79 },
    { color: 'yellow',      colorIndex: 7,  colorIndexHex: 0x7, colorCodeHex: 0xb8c76f, r: 0xb8, g: 0xc7, b: 0x6f },
    { color: 'orange',      colorIndex: 8,  colorIndexHex: 0x8, colorCodeHex: 0x6f4f25, r: 0x6f, g: 0x4f, b: 0x25 },
    { color: 'brown',       colorIndex: 9,  colorIndexHex: 0x9, colorCodeHex: 0x433900, r: 0x43, g: 0x39, b: 0x00 },
    { color: 'light red',   colorIndex: 10, colorIndexHex: 0xa, colorCodeHex: 0x9a6759, r: 0x9a, g: 0x67, b: 0x59 },
    { color: 'dark grey',   colorIndex: 11, colorIndexHex: 0xb, colorCodeHex: 0x444444, r: 0x44, g: 0x44, b: 0x44 },
    { color: 'grey',        colorIndex: 12, colorIndexHex: 0xc, colorCodeHex: 0x6c6c6c, r: 0x6c, g: 0x6c, b: 0x6c },
    { color: 'light green', colorIndex: 13, colorIndexHex: 0xd, colorCodeHex: 0x9ad284, r: 0x9a, g: 0xd2, b: 0x84 },
    { color: 'light blue',  colorIndex: 14, colorIndexHex: 0xe, colorCodeHex: 0x6c5eb5, r: 0x6c, g: 0x5e, b: 0xb5 },
    { color: 'light grey',  colorIndex: 15, colorIndexHex: 0xf, colorCodeHex: 0x959595, r: 0x94, g: 0x95, b: 0x95 },
]






const ColorPalette = {

    setup() {

        const palette = ref(defaultColors)
        const selectedColorIndex = ref(0)

        onMounted(() => {

            window.addEventListener("keydown", function(e) {

                if (ScreenStore.isDialogOpen()) {
                    return
                }

                e.preventDefault()


                if (e.key === 'ArrowRight' && e.altKey==false && e.shiftKey==false && e.ctrlKey==true  ) {
                    if (selectedColorIndex.value == palette.value[palette.value.length-1].colorIndex)
                        return
                    selectedColorIndex.value = selectedColorIndex.value + 1
                }

                if (e.key === 'ArrowLeft' && e.altKey==false && e.shiftKey==false && e.ctrlKey==true) {
                    if (selectedColorIndex.value == 0)
                        return
                    selectedColorIndex.value = selectedColorIndex.value - 1
                }

                if (e.key === 'ArrowDown' && e.altKey==false && e.shiftKey==false && e.ctrlKey==true) {
                    let newIndex = selectedColorIndex.value + 6
                    if (newIndex > palette.value.length)
                        return
                    selectedColorIndex.value = newIndex
                }

                if (e.key === 'ArrowUp' && e.altKey==false && e.shiftKey==false && e.ctrlKey==true) {
                    let newIndex = selectedColorIndex.value - 6
                    if (newIndex < 0)
                        return
                    selectedColorIndex.value = newIndex
                }

                if (e.key === 'Enter') {
                    onColorSelected({ target: { id: selectedColorIndex.value } })
                }

                /*
                if (e.key === '1' && e.altKey==false && e.shiftKey==false && e.ctrlKey==true) {
                    let color = getColorByIndex(selectedColorIndex.value)
                    BitmapStore.setBackgroundColorHires(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                    ScreenStore.refreshChar()
                    ScreenStore.doCharChange(ScreenStore.getMemoryPosition())
                }

                if (e.key === '2' && e.altKey==false && e.shiftKey==false && e.ctrlKey==true) {
                    let color = getColorByIndex(selectedColorIndex.value)
                    BitmapStore.setForegroundColorHires(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                    ScreenStore.refreshChar()
                    ScreenStore.doCharChange(ScreenStore.getMemoryPosition())
                }

                 */

            });
        })


        const onColorSelected = (e) => {
            selectedColorIndex.value = e.target.id
            let color = getColorByIndex(e.target.id)
            console.log('onColorSelected', { selectedColorIndex, color, e } )
            if (BitmapStore.isMCM()) {
                // ---------------------------------
                // -----           MCM        ------
                // ---------------------------------
                if (ScreenStore.getSelectedColorPart()==='b') {
                    BitmapStore.setBackgroundColorMCM(color.colorIndexHex)
                    ScreenStore.refreshAll()
                }
                if (ScreenStore.getSelectedColorPart()==='f') {
                    BitmapStore.setForegroundColorMCM(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                }
                if (ScreenStore.getSelectedColorPart()==='f2') {
                    BitmapStore.setForegroundColor2MCM(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                }

                if (ScreenStore.getSelectedColorPart()==='f3') {
                    BitmapStore.setForegroundColor3MCM(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                }

            } else {
                // --------------------------------
                // -----         Hires       ------
                // --------------------------------
                if (ScreenStore.getSelectedColorPart()==='b') {
                    BitmapStore.setBackgroundColorHires(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                }
                if (ScreenStore.getSelectedColorPart()==='f') {
                    BitmapStore.setForegroundColorHires(ScreenStore.getMemoryPosition(), color.colorIndexHex)
                }
            }

            ScreenStore.refreshChar()
            ScreenStore.doCharChange(ScreenStore.getMemoryPosition())

        }

        const onColorEdit = (e) => {
            console.log('onColorEdit: not yet implemented ', { e })
        }

        const createBlock = (blockId, r, g, b, css) => {
            return h('div', { onClick: (e) => onColorSelected(e), onDblClick: (e) => onColorEdit(e), id: blockId, class: css, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')'} )
        }

        const getColorByIndex = (idx) => palette.value.find( color => color.colorIndex==parseInt(idx))

        return { palette, selectedColorIndex, onColorSelected, getColorByIndex, onColorEdit, createBlock }

    },
    render() {

        let result = []
        this.palette.forEach( color => {
            let css = 'color'
            if (color.colorIndex==this.selectedColorIndex) {
                css = 'colorCursor'
            }
            result.push(this.createBlock(color.colorIndex, color.r, color.g, color.b, css))
        })
        return result
    }

}




export { ColorPalette, defaultColors }