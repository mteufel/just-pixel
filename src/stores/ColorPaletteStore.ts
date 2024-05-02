// @ts-nocheck

import {Color, defaultColors} from "../modals/palette/ColorPalette";
import BitmapStore from "./BitmapStore";
import {Palettes} from "../helpers/importer/profiles/Palettes";

const createColorPaletteStore = () => {

    let defaultColors:Array<Color> = Palettes.toJustPixel(Palettes.JustPixelPalette)
    let colors:Array<Color> = defaultColors

    return {
        initPalette: () => {
            if (BitmapStore.isFCM()) {
                for (let i = 16; i < 255; i++) {
                    colors[i] = { color: 'light blue',  colorIndex: i, r: 0x6c, g: 0x5e, b: 0xb5 }
                }
            }
            return colors
        },
        makePaletteWhite: () => {
            colors = defaultColors
            for (let i = 16; i < 255; i++) {
                colors[i] =  { color: 'white',       colorIndex: i, r: 255, g: 255, b: 255 }
            }
        },
        colors: () => colors,
        getColorByIndex: (idx : number) => colors.find( color => color.colorIndex==idx),
        setColor: (index, r, g, b) => colors[index] =  { color: 'color-' + index, colorIndex: index, r: r, g: g, b: b },
        defaultColors: () => defaultColors
    }
}

export default createColorPaletteStore()