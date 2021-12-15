// @ts-nocheck

import {Color, defaultColors} from "../components/palette/ColorPalette";
import BitmapStore from "./BitmapStore";

const createColorPaletteStore = () => {

    let defaultColors : Color[] = [
        { color: 'black',       colorIndex: 0, r: 0, g: 0, b: 0 },
        { color: 'white',       colorIndex: 1, r: 255, g: 255, b: 255 },
        { color: 'red',         colorIndex: 2, r: 0x68, g: 0x37, b: 0x2b },
        { color: 'cyan',        colorIndex: 3, r: 0x70, g: 0xa4, b: 0xb2 },
        { color: 'purple',      colorIndex: 4, r: 0x6f, g: 0x3d, b: 0x86 },
        { color: 'green',       colorIndex: 5, r: 0x58, g: 0x85, b: 0x43 },
        { color: 'blue',        colorIndex: 6, r: 0x35, g: 0x28, b: 0x79 },
        { color: 'yellow',      colorIndex: 7, r: 0xb8, g: 0xc7, b: 0x6f },
        { color: 'orange',      colorIndex: 8, r: 0x6f, g: 0x4f, b: 0x25 },
        { color: 'brown',       colorIndex: 9, r: 0x43, g: 0x39, b: 0x00 },
        { color: 'light red',   colorIndex: 10, r: 0x9a, g: 0x67, b: 0x59 },
        { color: 'dark grey',   colorIndex: 11, r: 0x44, g: 0x44, b: 0x44 },
        { color: 'grey',        colorIndex: 12, r: 0x6c, g: 0x6c, b: 0x6c },
        { color: 'light green', colorIndex: 13, r: 0x9a, g: 0xd2, b: 0x84 },
        { color: 'light blue',  colorIndex: 14, r: 0x6c, g: 0x5e, b: 0xb5 },
        { color: 'light grey',  colorIndex: 15, r: 0x94, g: 0x95, b: 0x95 },
    ]


    let colors = defaultColors

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