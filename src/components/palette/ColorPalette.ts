// @ts-nocheck
import {h, onMounted, ref, watch} from 'vue'
import ScreenStore from "../../stores/ScreenStore"
import BitmapStore from "../../stores/BitmapStore"
import {ColorSelectionModal, ColorSelectionStore} from "./ColorSelectionModal"

import { getColr } from "../../util/utils"
import ColorPaletteStore from "../../stores/ColorPaletteStore";
import {PaletteUpDownload} from "./PaletteUpDownload";
import {defineColorPaletteKeys} from "../../util/keys";


const ColorPalette = {

    setup( props, { emit } ) {
        let palette = ref(ColorPaletteStore.colors())
        const selectedColorIndex = ref(0)

        // this makes sure that the color gets selected when moving inside palette
        watch(selectedColorIndex, (newValue : any, oldValue : any) => {
            onColorSelected({ target: { id: parseInt(newValue) } })
        })


        const onColorSelected = (e : any) => {

            let color = getColorByIndex(e.target.id)
            selectedColorIndex.value = e.target.id
            if (e.detail==2) {
                onColorEdit(color)
                e.preventDefault()
                return
            }



            ColorSelectionStore.setColor(color)
            console.log('onColorSelected', { selectedColorIndex, color, e, props } )
            if (BitmapStore.isFCM()) {
                // ---------------------------------
                // -----           FCM        ------
                // ---------------------------------
                if (ScreenStore.getSelectedColorPart()==='f') {
                    BitmapStore.setForegroundColor1FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f2') {
                    BitmapStore.setForegroundColor2FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f3') {
                    BitmapStore.setForegroundColor3FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f4') {
                    BitmapStore.setForegroundColor4FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f5') {
                    BitmapStore.setForegroundColor5FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f6') {
                    BitmapStore.setForegroundColor6FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f7') {
                    BitmapStore.setForegroundColor7FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f8') {
                    BitmapStore.setForegroundColor8FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f9') {
                    BitmapStore.setForegroundColor9FCM(color)
                }
                if (ScreenStore.getSelectedColorPart()==='f0') {
                    BitmapStore.setForegroundColor0FCM(color)
                }


            } else if (BitmapStore.isMCM()) {
                // ---------------------------------
                // -----           MCM        ------
                // ---------------------------------
                if (ScreenStore.getSelectedColorPart()==='b') {
                    BitmapStore.setBackgroundColorMCM(color)
                    ScreenStore.refreshAll()
                }
                if (ScreenStore.getSelectedColorPart()==='f') {
                    BitmapStore.setForegroundColorMCM(ScreenStore.getMemoryPosition(), color)
                }
                if (ScreenStore.getSelectedColorPart()==='f2') {
                    BitmapStore.setForegroundColor2MCM(ScreenStore.getMemoryPosition(), color)
                }

                if (ScreenStore.getSelectedColorPart()==='f3') {
                    BitmapStore.setForegroundColor3MCM(ScreenStore.getMemoryPosition(), color)
                }

            } else {
                // --------------------------------
                // -----         Hires       ------
                // --------------------------------
                if (ScreenStore.getSelectedColorPart()==='b') {
                    BitmapStore.setBackgroundColorHires(ScreenStore.getMemoryPosition(), color.colorIndex)
                }
                if (ScreenStore.getSelectedColorPart()==='f') {
                    BitmapStore.setForegroundColorHires(ScreenStore.getMemoryPosition(), color.colorIndex)
                }
            }

            ScreenStore.refreshChar()
            ScreenStore.doCharChange(ScreenStore.getMemoryPosition())


        }

        const onColorEdit = (color : any) => {
            console.log('onColorEdit open: ', { color })
            ColorSelectionStore.setColor( color )
            ColorSelectionStore.toggle()
        }

        const createBlock = (blockId : number, r : number, g : number, b : number, css : string) => {
            return h('div', { onClick: (e) => onColorSelected(e), id: blockId, class: css, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')'} )
        }

        const getColorByIndex = (idx : number) => palette.value.find( color => color.colorIndex==idx)

        const onColorSelectionModal = (data : any) =>  {

            ColorSelectionStore.color().r = data.rgba.r
            ColorSelectionStore.color().g = data.rgba.g
            ColorSelectionStore.color().b = data.rgba.a
            ColorSelectionStore.color().color = 'custom-' + ColorSelectionStore.color().colorIndex

            ColorPaletteStore.colors()[ColorSelectionStore.color().colorIndex] = ColorSelectionStore.color()
            selectedColorIndex.value = ColorSelectionStore.color().colorIndex
        }

        const reRenderColorPalette = () => {
            console.log('abc')
            selectedColorIndex.value = selectedColorIndex.value+1
            selectedColorIndex.value = selectedColorIndex.value-1
        }

        defineColorPaletteKeys( { selectedColorIndex, palette } )

        return { palette, selectedColorIndex, onColorSelected, getColorByIndex, onColorEdit, createBlock, onColorSelectionModal, reRenderColorPalette }

    },
    render() {
        console.log('Render Color Palette.....')
        let result = []
        this.palette.forEach( color => {
            let css = 'color'
            if (color.colorIndex==this.selectedColorIndex) {
                css = 'colorCursor'
            }
            result.push(this.createBlock(color.colorIndex, color.r, color.g, color.b, css))
        })
        result.push(h(ColorSelectionModal, { onColorSelectionModal: data => this.onColorSelectionModal(data) }))
        result.push(h(PaletteUpDownload, { onReRender: () => this.reRenderColorPalette() }))
        console.log('Render Color Palette..... End')
        return result
    }

}

export { Color, ColorPalette, defaultColors }
